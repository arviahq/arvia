import type { Span } from "../../diagnostics.js";
import type { AtRuleIR, DeclIR, FileIR, RawRuleIR, StyleIR } from "../../ir/ir.js";
import { cssVarName, isColorValue } from "../../ir/ir.js";
import { baseClass, compoundClass, variantClass } from "../../ir/names.js";
import { buildCssSourceMap, type CssMapping, type CssSourceMap } from "./sourcemap.js";

export type { CssSourceMap } from "./sourcemap.js";

const declLines = (decls: DeclIR[]): string =>
  decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");

/** At-rules whose body holds descriptors / page-margin boxes, not element
 *  styles — their declarations are never scoped to a class, even when written
 *  inside a component (`@font-face { font-family: … }` must emit verbatim). */
const DESCRIPTOR_AT_RULES = new Set([
  "font-face",
  "font-feature-values",
  "counter-style",
  "property",
  "page",
  "viewport",
]);

/** A nested `selector { … }` rule, emitted verbatim (keyframe steps, raw
 *  rules inside a passed-through at-rule). */
function emitRawRule(r: RawRuleIR): string {
  const inner: string[] = [];
  if (r.decls.length > 0) inner.push(declLines(r.decls));
  for (const nested of r.rules) inner.push(emitRawRule(nested));
  for (const at of r.atRules) inner.push(emitFreeAtRule(at));
  return `${r.selector} {\n${inner.join("\n\n")}\n}`;
}

/** A raw at-rule emitted verbatim (top-level / global): bare declarations,
 *  nested rules and nested at-rules pass through as authored. */
function emitFreeAtRule(at: AtRuleIR): string {
  if (at.statement) return `${at.prelude};`;
  const inner: string[] = [];
  if (at.decls.length > 0) inner.push(declLines(at.decls));
  for (const r of at.rules) inner.push(emitRawRule(r));
  for (const child of at.atRules) inner.push(emitFreeAtRule(child));
  return `${at.prelude} {\n${inner.join("\n\n")}\n}`;
}

/** A raw at-rule attached to a component slot / style: bare declarations are
 *  wrapped in the owning class so `@media (...) { color: red }` targets the
 *  element. Descriptor at-rules (`@font-face`, …) and statements emit verbatim.
 *  Nested rules/at-rules pass through. */
function emitScopedAtRule(at: AtRuleIR, className: string): string {
  if (at.statement || DESCRIPTOR_AT_RULES.has(at.name)) return emitFreeAtRule(at);
  const inner: string[] = [];
  if (at.decls.length > 0) inner.push(`.${className} {\n${declLines(at.decls)}\n}`);
  for (const r of at.rules) inner.push(emitRawRule(r));
  for (const child of at.atRules) inner.push(emitScopedAtRule(child, className));
  return `${at.prelude} {\n${inner.join("\n\n")}\n}`;
}

/** Emits static, minification-ready CSS. */
export function emitCss(ir: FileIR): string {
  return emitCssWithMap(ir).css;
}

/**
 * CSS plus a rule-level source map: every rule maps back to the name of the
 * component/style/keyframes it was generated from (devtools jump-to-source).
 */
export function emitCssWithMap(
  ir: FileIR,
  source?: { file: string; content: string | null },
): { css: string; map: CssSourceMap | null } {
  const chunks: { text: string; span: Span | null }[] = [];
  // The declaration anchor for whatever section is currently emitting.
  let anchor: Span | null = null;
  const out = {
    push: (text: string) => {
      chunks.push({ text, span: anchor });
    },
  };

  const rule = (selector: string, decls: DeclIR[]) => {
    if (decls.length === 0) return;
    const body = decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
    out.push(`${selector} {\n${body}\n}`);
  };

  const styleRules = (
    className: string,
    style: StyleIR,
    component?: FileIR["components"][number],
  ) => {
    rule(`.${className}`, style.decls);
    for (const state of style.states) {
      rule(state.selectors.map((s) => `.${className}${s}`).join(",\n"), state.decls);
      // Cross-slot states ("group hover"): the owner carries the state, the
      // target element is matched by its always-present base slot class.
      if (state.slotDecls && component) {
        for (const [slot, decls] of Object.entries(state.slotDecls)) {
          rule(
            state.selectors
              .map((s) => `.${className}${s} .${baseClass(component, slot)}`)
              .join(",\n"),
            decls,
          );
        }
      }
    }
    for (const at of style.atRules) out.push(emitScopedAtRule(at, className));
  };

  // Emits a component/style's rules; if it was declared inside at-rules, wraps
  // its whole output in the prelude chain (outer→inner), e.g. `@layer base { … }`.
  const emitConstruct = (anchorSpan: Span, layers: string[] | undefined, fn: () => void) => {
    anchor = anchorSpan;
    if (!layers || layers.length === 0) {
      fn();
      anchor = null;
      return;
    }
    const start = chunks.length;
    fn();
    const produced = chunks.splice(start);
    if (produced.length > 0) {
      let body = produced.map((c) => c.text).join("\n\n");
      for (let i = layers.length - 1; i >= 0; i--) body = `${layers[i]} {\n${body}\n}`;
      chunks.push({ text: body, span: anchorSpan });
    }
    anchor = null;
  };

  // Statement at-rules (`@import`, `@charset`, `@layer a, b;`) must precede all
  // other rules — hoist them to the very top of the output.
  for (const at of ir.globalAtRules) {
    if (!at.statement) continue;
    anchor = at.anchor ?? null;
    out.push(emitFreeAtRule(at));
  }
  anchor = null;

  if (ir.themeVars.length > 0 && ir.themeModes) {
    const defaultMode = ir.themeModes[0]!;
    const altModes = ir.themeModes.slice(1);

    // Native path: when the modes are exactly the two CSS `color-scheme`
    // keywords, drive theming with `color-scheme` + `light-dark()`. Color
    // tokens collapse to a single declaration each (no `:root`/media/attribute
    // duplication), native UA widgets follow the scheme, and the attribute just
    // flips `color-scheme`. Any other mode shape falls back to the legacy
    // four-block emission below.
    const isLightDarkTheme =
      ir.themeModes.length === 2 && ir.themeModes[0] === "light" && ir.themeModes[1] === "dark";

    if (isLightDarkTheme) {
      const rootDecls: DeclIR[] = [{ property: "color-scheme", value: "light dark" }];
      // Mode-varying tokens that aren't plain colors (e.g. box-shadow) can't use
      // light-dark(); they keep OS-driven (@media) and explicit (attribute)
      // overrides.
      const mediaDecls: DeclIR[] = [];
      const lightOverrides: DeclIR[] = [];
      const darkOverrides: DeclIR[] = [];

      for (const v of ir.themeVars) {
        const prop = cssVarName(v.group, v.name);
        const light = v.byMode.light!;
        const dark = v.byMode.dark;
        if (dark === undefined || dark === light) {
          rootDecls.push({ property: prop, value: light }); // invariant
        } else if (isColorValue(light) && isColorValue(dark)) {
          rootDecls.push({ property: prop, value: `light-dark(${light}, ${dark})` });
        } else {
          rootDecls.push({ property: prop, value: light });
          mediaDecls.push({ property: prop, value: dark });
          lightOverrides.push({ property: prop, value: light });
          darkOverrides.push({ property: prop, value: dark });
        }
      }

      rule(":root", rootDecls);
      if (mediaDecls.length > 0) {
        const body = mediaDecls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
        out.push(`@media (prefers-color-scheme: dark) {\n  :root {\n${body}\n  }\n}`);
      }
      // Emitted after the media block so an explicit attribute wins at equal
      // specificity. color-scheme alone flips every light-dark() color.
      rule(`[data-arvia-theme="light"]`, [
        { property: "color-scheme", value: "light" },
        ...lightOverrides,
      ]);
      rule(`[data-arvia-theme="dark"]`, [
        { property: "color-scheme", value: "dark" },
        ...darkOverrides,
      ]);
    } else {
      const fullDecls = (mode: string): DeclIR[] =>
        ir.themeVars.map((v) => ({
          property: cssVarName(v.group, v.name),
          value: v.byMode[mode]!,
        }));

      const overrideDecls = (mode: string): DeclIR[] => {
        const decls: DeclIR[] = [];
        for (const v of ir.themeVars) {
          const value = v.byMode[mode];
          if (value !== undefined && value !== v.byMode[defaultMode]) {
            decls.push({ property: cssVarName(v.group, v.name), value });
          }
        }
        return decls;
      };

      rule(":root", fullDecls(defaultMode));

      const mediaDarkDecls = altModes.length > 0 ? overrideDecls(altModes[0]!) : [];
      if (mediaDarkDecls.length > 0) {
        const body = mediaDarkDecls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
        out.push(`@media (prefers-color-scheme: dark) {\n  :root {\n${body}\n  }\n}`);
      }

      rule(`[data-arvia-theme="${defaultMode}"]`, fullDecls(defaultMode));
      for (const mode of altModes) {
        const decls = overrideDecls(mode);
        if (decls.length > 0) rule(`[data-arvia-theme="${mode}"]`, decls);
      }
    }
  }

  for (const at of ir.globalAtRules) {
    if (at.statement) continue; // already hoisted above
    anchor = at.anchor ?? null;
    out.push(emitFreeAtRule(at));
  }
  anchor = null;

  for (const global of ir.globals) {
    rule(global.selector, global.decls);
  }

  for (const c of ir.components) {
    emitConstruct(c.nameSpan, c.layers, () => {
      for (const slot of c.slotNames) {
        styleRules(baseClass(c, slot), c.base[slot]!, c);
      }
      for (const variant of c.variants) {
        for (const value of variant.values) {
          for (const slot of c.slotNames) {
            const style = value.slots[slot];
            if (style) styleRules(variantClass(c, variant.name, value.name, slot), style, c);
          }
        }
      }
      for (const compound of c.compounds) {
        for (const slot of c.slotNames) {
          const style = compound.slots[slot];
          if (style) styleRules(compoundClass(c, compound.match, slot), style, c);
        }
      }
    });
  }

  // Standalone styles last (utilities-last): composed styles win the cascade.
  for (const s of ir.styles) {
    emitConstruct(s.nameSpan, s.layers, () => styleRules(s.className, s.style));
  }

  if (chunks.length === 0) return { css: "", map: null };

  const css = chunks.map((c) => c.text).join("\n\n") + "\n";
  if (!source) return { css, map: null };

  const mappings: CssMapping[] = [];
  let line = 0;
  for (const chunk of chunks) {
    if (chunk.span) mappings.push({ generatedLine: line, span: chunk.span });
    line += chunk.text.split("\n").length + 1; // +1 for the blank separator
  }
  return { css, map: buildCssSourceMap(mappings, source) };
}

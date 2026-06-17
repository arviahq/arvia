import type { Span } from "../../diagnostics.js";
import type { AtRuleIR, DeclIR, FileIR, RawRuleIR, StyleIR } from "../../ir/ir.js";
import { cssVarName, isColorValue } from "../../ir/ir.js";
import { baseClass, compoundClass, variantClass } from "../../ir/names.js";
import { classify } from "./partition.js";
import { buildCssSourceMap, type CssMapping, type CssSourceMap } from "./sourcemap.js";

export type { CssSourceMap } from "./sourcemap.js";

/**
 * The combined CSS string split into its output buckets: shared `global` CSS
 * (statement at-rules, theme tokens, verbatim global at-rules, global element
 * rules), per-component CSS, and standalone `styles` (utilities). Concatenating
 * the non-empty buckets in this order reproduces the combined string exactly —
 * see {@link combineCssParts}. Consumed by component-mode disk emission and the
 * CSS manifest; in single mode it collapses back via `combineCssParts`.
 */
export interface CssParts {
  global: string;
  components: { name: string; css: string }[];
  styles: string;
}

/** Re-joins {@link CssParts} into the canonical combined CSS string. The
 *  inverse of the split performed in {@link emitCssWithMap}: empty buckets
 *  contribute nothing (no stray separators), and a fully empty file yields the
 *  empty string. `combineCssParts(parts) === emitCss(ir)` for every file. */
export function combineCssParts(parts: CssParts): string {
  const sections = [parts.global, ...parts.components.map((c) => c.css), parts.styles].filter(
    (s) => s.length > 0,
  );
  return sections.length > 0 ? sections.join("\n\n") + "\n" : "";
}

/** Which output bucket a generated chunk belongs to. Components are keyed by
 *  index (not name) so duplicate component names in one file stay distinct. */
type PartKey = { kind: "global" } | { kind: "component"; index: number } | { kind: "styles" };

const declLines = (decls: DeclIR[]): string =>
  decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");

/** At-rules whose body holds descriptors / page-margin boxes, not element
 *  styles — their declarations are never scoped to a class, even when written
 *  inside a component (`@font-face { font-family: … }` must emit verbatim).
 *
 *  This list can't be derived from syntax: `@media { color: red }` (element
 *  style → class-wrapped) and `@font-face { font-family: x }` (descriptor →
 *  verbatim) are syntactically identical; the distinction lives in the CSS
 *  spec. It only matters for a descriptor at-rule *nested inside a component*
 *  — at the top level or in `global` every at-rule emits verbatim regardless
 *  of name (see emitFreeAtRule), so a new/unlisted at-rule always works there.
 *  Unknown at-rules nested in a component default to class-wrapping, which
 *  suits the more common future case (grouping rules like `@scope` /
 *  `@starting-style`). When the spec adds descriptor at-rules, add them here. */
const DESCRIPTOR_AT_RULES = new Set([
  "font-face",
  "font-feature-values",
  "font-palette-values",
  "counter-style",
  "property",
  "page",
  "position-try",
  "view-transition",
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
): { css: string; map: CssSourceMap | null; parts: CssParts } {
  const graph = classify(ir);
  const chunks: { text: string; span: Span | null; part: PartKey }[] = [];
  // The declaration anchor for whatever section is currently emitting.
  let anchor: Span | null = null;
  // The output bucket the currently-emitting section belongs to. Sections run
  // sequentially, so a single mutable cursor suffices.
  let part: PartKey = { kind: "global" };
  const out = {
    push: (text: string) => {
      chunks.push({ text, span: anchor, part });
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
      chunks.push({ text: body, span: anchorSpan, part });
    }
    anchor = null;
  };

  const { statementAtRules, themeVars, themeModes, globalAtRules, globals } = graph.global;

  // Statement at-rules (`@import`, `@charset`, `@layer a, b;`) must precede all
  // other rules — hoist them to the very top of the output.
  for (const at of statementAtRules) {
    anchor = at.anchor ?? null;
    out.push(emitFreeAtRule(at));
  }
  anchor = null;

  if (themeVars.length > 0 && themeModes) {
    const defaultMode = themeModes[0]!;
    const altModes = themeModes.slice(1);

    // Native path: when the modes are exactly the two CSS `color-scheme`
    // keywords, drive theming with `color-scheme` + `light-dark()`. Color
    // tokens collapse to a single declaration each (no `:root`/media/attribute
    // duplication), native UA widgets follow the scheme, and the attribute just
    // flips `color-scheme`. Any other mode shape falls back to the legacy
    // four-block emission below.
    const isLightDarkTheme =
      themeModes.length === 2 && themeModes[0] === "light" && themeModes[1] === "dark";

    if (isLightDarkTheme) {
      const rootDecls: DeclIR[] = [{ property: "color-scheme", value: "light dark" }];
      // Mode-varying tokens that aren't plain colors (e.g. box-shadow) can't use
      // light-dark(); they keep OS-driven (@media) and explicit (attribute)
      // overrides.
      const mediaDecls: DeclIR[] = [];
      const lightOverrides: DeclIR[] = [];
      const darkOverrides: DeclIR[] = [];

      for (const v of themeVars) {
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
        themeVars.map((v) => ({
          property: cssVarName(v.group, v.name),
          value: v.byMode[mode]!,
        }));

      const overrideDecls = (mode: string): DeclIR[] => {
        const decls: DeclIR[] = [];
        for (const v of themeVars) {
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

  for (const at of globalAtRules) {
    anchor = at.anchor ?? null;
    out.push(emitFreeAtRule(at));
  }
  anchor = null;

  for (const global of globals) {
    rule(global.selector, global.decls);
  }

  graph.components.forEach(({ component: c }, index) => {
    part = { kind: "component", index };
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
  });

  // Standalone styles last (utilities-last): composed styles win the cascade.
  part = { kind: "styles" };
  for (const s of graph.styles) {
    emitConstruct(s.nameSpan, s.layers, () => styleRules(s.className, s.style));
  }

  // Group chunks back into output buckets. Chunks are emitted strictly in
  // bucket order (global → each component → styles), so a component's chunks
  // are contiguous; `combineCssParts` re-joins them into the combined string.
  const globalText: string[] = [];
  const componentTexts = graph.components.map(() => [] as string[]);
  const styleTexts: string[] = [];
  for (const chunk of chunks) {
    if (chunk.part.kind === "global") globalText.push(chunk.text);
    else if (chunk.part.kind === "styles") styleTexts.push(chunk.text);
    else componentTexts[chunk.part.index]!.push(chunk.text);
  }
  const parts: CssParts = {
    global: globalText.join("\n\n"),
    components: graph.components.map(({ component }, i) => ({
      name: component.name,
      css: componentTexts[i]!.join("\n\n"),
    })),
    styles: styleTexts.join("\n\n"),
  };

  if (chunks.length === 0) return { css: "", map: null, parts };

  const css = chunks.map((c) => c.text).join("\n\n") + "\n";
  if (!source) return { css, map: null, parts };

  const mappings: CssMapping[] = [];
  let line = 0;
  for (const chunk of chunks) {
    if (chunk.span) mappings.push({ generatedLine: line, span: chunk.span });
    line += chunk.text.split("\n").length + 1; // +1 for the blank separator
  }
  return { css, map: buildCssSourceMap(mappings, source), parts };
}

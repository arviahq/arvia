import type { Span } from "../../diagnostics.js";
import type { DeclIR, FileIR, StyleIR } from "../../ir/ir.js";
import { cssVarName, isColorValue } from "../../ir/ir.js";
import {
  baseClass,
  compoundClass,
  containerVariantClass,
  responsiveVariantClass,
  variantClass,
} from "../../ir/names.js";
import { buildCssSourceMap, type CssMapping, type CssSourceMap } from "./sourcemap.js";

export type { CssSourceMap } from "./sourcemap.js";

// Half-open [lower, upper) ranges. The `>=`-only form keeps emitting `min-width`
// (byte-identical to pre-range output); bounded forms use modern range syntax,
// which needs no exclusive-upper epsilon.
const mediaQuery = (lower: string | null, upper: string | null): string => {
  if (lower && !upper) return `@media (min-width: ${lower})`;
  if (!lower && upper) return `@media (width < ${upper})`;
  return `@media (${lower} <= width < ${upper})`;
};
const containerQuery = (lower: string | null, upper: string | null): string => {
  if (lower && !upper) return `@container (min-width: ${lower})`;
  if (!lower && upper) return `@container (inline-size < ${upper})`;
  return `@container (${lower} <= inline-size < ${upper})`;
};

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
  };

  const emitConditionalRules = (
    entries: {
      key: string;
      lower: string | null;
      upper: string | null;
      variants: Record<string, string>;
    }[],
    classFn: (
      c: FileIR["components"][number],
      variant: string,
      value: string,
      key: string,
      slot: string,
    ) => string,
    wrap: (lower: string | null, upper: string | null, rules: string[]) => string,
    component: FileIR["components"][number],
  ) => {
    const grouped = new Map<
      string,
      { lower: string | null; upper: string | null; rules: string[] }
    >();
    for (const entry of entries) {
      // A fully-unresolved head (unknown bare breakpoint) emits nothing — the
      // checker has already reported it.
      if (!entry.lower && !entry.upper) continue;
      const group = grouped.get(entry.key) ?? {
        lower: entry.lower,
        upper: entry.upper,
        rules: [],
      };
      const rules = group.rules;
      for (const [variantName, valueName] of Object.entries(entry.variants)) {
        const variant = component.variants.find((v) => v.name === variantName);
        const value = variant?.values.find((v) => v.name === valueName);
        if (!value) continue;
        for (const slot of component.slotNames) {
          const style = value.slots[slot];
          if (!style) continue;
          const className = classFn(component, variantName, valueName, entry.key, slot);
          const chunk: string[] = [];
          const emit = (selector: string, decls: DeclIR[]) => {
            if (decls.length === 0) return;
            const body = decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
            chunk.push(`${selector} {\n${body}\n}`);
          };
          emit(`.${className}`, style.decls);
          for (const state of style.states) {
            emit(state.selectors.map((s) => `.${className}${s}`).join(",\n"), state.decls);
            if (state.slotDecls) {
              for (const [target, decls] of Object.entries(state.slotDecls)) {
                emit(
                  state.selectors
                    .map((s) => `.${className}${s} .${baseClass(component, target)}`)
                    .join(",\n"),
                  decls,
                );
              }
            }
          }
          rules.push(...chunk);
        }
      }
      grouped.set(entry.key, group);
    }
    for (const { lower, upper, rules } of grouped.values()) {
      if (rules.length > 0) out.push(wrap(lower, upper, rules));
    }
  };

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

  for (const kf of ir.keyframes) {
    anchor = kf.nameSpan;
    const steps = kf.steps
      .map((step) => {
        const body = step.decls.map((d) => `  ${d.property}: ${d.value};`).join("\n");
        return `${step.selector} {\n${body}\n}`;
      })
      .join("\n\n");
    out.push(`@keyframes ${kf.cssName} {\n${steps}\n}`);
  }

  anchor = null;
  for (const global of ir.globals) {
    rule(global.selector, global.decls);
  }

  for (const c of ir.components) {
    anchor = c.nameSpan;
    if (c.containers.length > 0) {
      const root = baseClass(c, "root");
      rule(`.${root}`, [{ property: "container-type", value: "inline-size" }]);
    }

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

    emitConditionalRules(
      c.responsive.map((r) => ({
        key: r.breakpoint,
        lower: r.lower,
        upper: r.upper,
        variants: r.variants,
      })),
      responsiveVariantClass,
      (lower, upper, rules) => `${mediaQuery(lower, upper)} {\n${rules.join("\n\n")}\n}`,
      c,
    );

    emitConditionalRules(
      c.containers.map((r) => ({
        key: r.container,
        lower: r.lower,
        upper: r.upper,
        variants: r.variants,
      })),
      containerVariantClass,
      (lower, upper, rules) => `${containerQuery(lower, upper)} {\n${rules.join("\n\n")}\n}`,
      c,
    );

    for (const compound of c.compounds) {
      for (const slot of c.slotNames) {
        const style = compound.slots[slot];
        if (style) styleRules(compoundClass(c, compound.match, slot), style, c);
      }
    }
  }

  // Standalone styles last (utilities-last): composed styles win the cascade.
  for (const s of ir.styles) {
    anchor = s.nameSpan;
    styleRules(s.className, s.style);
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

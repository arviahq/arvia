/** Classifies a single file's IR into the global / component / utility buckets
 *  that drive CSS output partitioning. This is a pure structural projection of
 *  `FileIR` — it never parses or reorders emitted CSS, so the buckets carry the
 *  same IR nodes the emitter already consumes (preserving `layers`, anchors and
 *  the descriptor-at-rule distinction). Later phases route these buckets to a
 *  shared `global.css` plus per-component files; in single mode they are simply
 *  concatenated back in canonical order. */

import type {
  AtRuleIR,
  ComponentIR,
  FileIR,
  GlobalRuleIR,
  StyleDeclIR,
  ThemeVarIR,
} from "../../ir/ir.js";

/** Project-shared CSS not scoped to one component: statement at-rules, theme
 *  tokens, verbatim block at-rules (resets/fonts/keyframes) and global element
 *  rules. In the per-file model this is overwhelmingly the theme file. */
export interface GlobalStyleBucket {
  /** `@import` / `@charset` / `@layer a, b;` — must precede every other rule. */
  statementAtRules: AtRuleIR[];
  themeVars: ThemeVarIR[];
  themeModes: string[] | null;
  /** Block at-rules from the top level / `global {}` (font-face, keyframes, …). */
  globalAtRules: AtRuleIR[];
  globals: GlobalRuleIR[];
}

/** One component's scoped rules. Phase 1 keeps a 1:1 list per file; later
 *  phases key these by component identity for per-component output files. */
export interface ComponentStyleBucket {
  component: ComponentIR;
}

/** The classified view of a single `FileIR`. */
export interface StyleGraph {
  global: GlobalStyleBucket;
  components: ComponentStyleBucket[];
  /** Standalone exported styles, emitted utilities-last. */
  styles: StyleDeclIR[];
}

/**
 * Projects a `FileIR` into a `StyleGraph`. Splits `globalAtRules` into statement
 * vs block at-rules exactly as the emitter does inline, and carries every other
 * section through by reference (no cloning, no reordering, no mutation of `ir`).
 */
export function classify(ir: FileIR): StyleGraph {
  const statementAtRules: AtRuleIR[] = [];
  const globalAtRules: AtRuleIR[] = [];
  for (const at of ir.globalAtRules) {
    (at.statement ? statementAtRules : globalAtRules).push(at);
  }
  return {
    global: {
      statementAtRules,
      themeVars: ir.themeVars,
      themeModes: ir.themeModes,
      globalAtRules,
      globals: ir.globals,
    },
    components: ir.components.map((component) => ({ component })),
    styles: ir.styles,
  };
}

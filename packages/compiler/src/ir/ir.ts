/** Normalized, fully-resolved representation consumed by the generators.
 *  By IR time: token refs are inlined values, recipes are flattened,
 *  the implicit `root` slot is materialized. */

import type { Span } from "../diagnostics.js";

export interface DeclIR {
  property: string;
  value: string;
}

export interface StateIR {
  /** Selector suffixes appended to the owning class, e.g. [":hover", ":focus"].
   *  A leading space marks a descendant part (`" .child"`). */
  selectors: string[];
  decls: DeclIR[];
  /** Cross-slot declarations ("group hover"): targetSlot → decls, emitted as
   *  `.owner<suffix> .targetSlotBaseClass`. Component contexts only. */
  slotDecls?: Record<string, DeclIR[]>;
}

/** A raw CSS at-rule, lowered for emission. `prelude` is the final CSS head
 *  (e.g. `@media (min-width: 768px)`, `@keyframes pulse`). */
export interface AtRuleIR {
  /** At-keyword without '@' (e.g. "media", "font-face") — drives verbatim vs
   *  class-scoped emission for descriptor at-rules. */
  name: string;
  prelude: string;
  decls: DeclIR[];
  rules: RawRuleIR[];
  atRules: AtRuleIR[];
  /** A blockless statement at-rule (`@import "x";`) — emitted as `prelude;`. */
  statement?: boolean;
  /** Source span of the at-keyword, for CSS source maps (free at-rules only). */
  anchor?: Span;
}

export interface RawRuleIR {
  selector: string;
  decls: DeclIR[];
  rules: RawRuleIR[];
  atRules: AtRuleIR[];
}

export interface StyleIR {
  decls: DeclIR[];
  states: StateIR[];
  /** Raw at-rules attached to this slot/style, emitted scoped to its class. */
  atRules: AtRuleIR[];
}

export type RecipeIR = StyleIR;

/** Per-token values keyed by theme mode name. */
export type TokenModes = Record<string, string>;

/** Tokens + resolved recipes shared across files (the conventional theme file). */
export interface ThemeEnv {
  /** null = single-mode (inline token values); non-null = CSS custom properties. */
  modes: string[] | null;
  tokens: Record<string, Record<string, string | TokenModes>>;
  /** Prose documentation keyed by token group and name. */
  tokenDocs: Record<string, Record<string, string>>;
  recipes: Record<string, RecipeIR>;
}

export function emptyEnv(): ThemeEnv {
  return {
    modes: null,
    tokens: {},
    tokenDocs: {},
    recipes: {},
  };
}

export function cssVarName(group: string, name: string): string {
  return `--arvia-${group}-${name}`;
}

/** True when `value` is a single CSS color (hex, functional notation, or a
 *  color keyword) — i.e. eligible to collapse into a `light-dark()` call.
 *  Multi-token values like `0 1px 2px rgba(...)` (box-shadow) return false and
 *  keep their per-mode override blocks. Named colors (`red`) aren't matched;
 *  they fall back to overrides too, which still renders correctly. */
export function isColorValue(value: string): boolean {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return true;
  if (/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\([^()]*\)$/i.test(v)) return true;
  if (/^(transparent|currentColor)$/i.test(v)) return true;
  return false;
}

export interface ThemeVarIR {
  group: string;
  name: string;
  doc: string | null;
  /** Resolved CSS values per mode (refs already substituted). */
  byMode: Record<string, string>;
}

export function emptyStyle(): StyleIR {
  return { decls: [], states: [], atRules: [] };
}

export function isEmptyStyle(s: StyleIR): boolean {
  return s.decls.length === 0 && s.states.length === 0 && s.atRules.length === 0;
}

export interface VariantValueIR {
  name: string;
  /** Only slots actually styled by this value appear here. */
  slots: Record<string, StyleIR>;
}

export interface VariantIR {
  name: string;
  values: VariantValueIR[];
}

export interface CompoundIR {
  /** [variant, value] pairs in variant-declaration order. */
  match: [string, string][];
  slots: Record<string, StyleIR>;
}

export interface ComponentIR {
  name: string;
  /** Span of the component name in the .arv source (for editor navigation). */
  nameSpan: Span;
  hash: string;
  /** Project-relative source path. Combined with `name` it forms the
   *  untruncated identity that seeds minified class hashes (so they never
   *  collide between components the way the truncated `hash` could). */
  rel: string;
  /** When true, class names are emitted as short identifier-safe hashes
   *  (production); when false, the readable `Component_variant_value_slot_hash`
   *  form (development / debugging). */
  minify: boolean;
  /** `root` first, then declared slots in source order. */
  slotNames: string[];
  base: Record<string, StyleIR>;
  variants: VariantIR[];
  compounds: CompoundIR[];
  defaults: Record<string, string>;
  /** Enclosing at-rule preludes (outer→inner) when declared inside an at-rule,
   *  e.g. `["@layer base"]`. The component's CSS is wrapped in this chain. */
  layers?: string[];
}

/** Standalone exported class from a top-level `style` declaration. */
export interface StyleDeclIR {
  name: string;
  /** Span of the style name in the .arv source (for editor navigation). */
  nameSpan: Span;
  hash: string;
  className: string;
  style: StyleIR;
  /** Enclosing at-rule preludes (outer→inner) when declared inside an at-rule. */
  layers?: string[];
}

export interface GlobalRuleIR {
  selector: string;
  decls: DeclIR[];
}

export interface FileIR {
  globals: GlobalRuleIR[];
  /** Raw at-rules from the top level and `global {}`, emitted verbatim. */
  globalAtRules: AtRuleIR[];
  components: ComponentIR[];
  /** Exported single-class styles, emitted after components (utilities-last). */
  styles: StyleDeclIR[];
  /** CSS custom property definitions when the source file declares theme modes. */
  themeVars: ThemeVarIR[];
  themeModes: string[] | null;
}

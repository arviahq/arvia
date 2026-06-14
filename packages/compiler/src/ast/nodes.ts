import type { Span } from "../diagnostics.js";

export interface ArviaFile {
  items: TopLevelItem[];
}

export type TopLevelItem =
  | ThemeBlock
  | GlobalBlock
  | RecipeDecl
  | StyleDecl
  | ComponentDecl
  | AtRule;

// --- theme ---------------------------------------------------------------

export interface ThemeBlock {
  kind: "theme";
  /** Declared when `modes: a | b;` is present — enables theme switching via CSS. */
  modes: string[] | null;
  modesSpan: Span | null;
  groups: TokenGroup[];
  span: Span;
}

export interface TokenGroup {
  name: string;
  nameSpan: Span;
  entries: TokenEntry[];
  overrides: ModeOverrideBlock[];
  span: Span;
}

export interface ModeOverrideBlock {
  mode: string;
  modeSpan: Span;
  entries: TokenEntry[];
  span: Span;
}

export interface TokenEntry {
  name: string;
  nameSpan: Span;
  value: RawValue;
  /** Optional prose documentation for design token catalogs. */
  doc: string | null;
  span: Span;
}

// --- global --------------------------------------------------------------

export interface GlobalBlock {
  kind: "global";
  rules: GlobalRule[];
  /** Raw at-rules written directly in the block (`global { @media { … } }`),
   *  emitted verbatim. */
  atRules: AtRule[];
  span: Span;
}

export interface GlobalRule {
  selector: string;
  decls: Declaration[];
  span: Span;
}

// --- at-rules ------------------------------------------------------------

/** A raw CSS at-rule (`@keyframes`, `@media`, `@container`, `@supports`, …)
 *  written anywhere and emitted verbatim. `prelude` carries the raw condition
 *  text after the keyword; token refs inside it are inlined to literals at IR
 *  time (so `@media (min-width: breakpoint.md)` → `@media (min-width: 768px)`). */
export interface AtRule {
  kind: "atrule";
  /** At-keyword without the leading '@' (e.g. "media", "keyframes"). */
  name: string;
  nameSpan: Span;
  /** Raw prelude text after the keyword (empty for `@layer { … }`). */
  prelude: string;
  preludeSpan: Span | null;
  body: AtRuleBody;
  span: Span;
}

export interface AtRuleBody {
  /** Bare declarations directly in the at-rule (e.g. inside `@supports`, or the
   *  sugar form scoped to the owning class). */
  decls: Declaration[];
  /** Nested `selector { … }` blocks: keyframe steps (`from`/`50%`), `.x { … }`. */
  rules: RawRule[];
  /** Nested at-rules (e.g. `@supports` inside `@media`). */
  atRules: AtRule[];
}

export interface RawRule {
  selector: string;
  selectorSpan: Span;
  body: AtRuleBody;
  span: Span;
}

// --- recipe --------------------------------------------------------------

export interface RecipeDecl {
  kind: "recipe";
  name: string;
  nameSpan: Span;
  items: StyleItem[];
  span: Span;
}

// --- style ----------------------------------------------------------------

/** Standalone exported class: `style truncate { … }` → `export const truncate`. */
export interface StyleDecl {
  kind: "styledecl";
  name: string;
  nameSpan: Span;
  items: StyleItem[];
  span: Span;
}

// --- component -----------------------------------------------------------

export interface ComponentDecl {
  kind: "component";
  name: string;
  nameSpan: Span;
  items: ComponentItem[];
  span: Span;
}

export type ComponentItem =
  | BaseBlock
  | SlotsBlock
  | VariantsBlock
  | DefaultsBlock
  | CompoundBlock
  | TokensBlock
  | UseStmt
  | Declaration
  | AtRule;

/** Component-scoped tokens: shadow theme tokens during resolution in this component only. */
export interface TokensBlock {
  kind: "tokens";
  groups: TokenGroup[];
  span: Span;
}

export interface BaseBlock {
  kind: "base";
  body: StyleBody;
  span: Span;
}

export interface SlotsBlock {
  kind: "slots";
  slots: SlotDecl[];
  span: Span;
}

export interface SlotDecl {
  name: string;
  nameSpan: Span;
  items: StyleItem[];
  span: Span;
}

export interface VariantsBlock {
  kind: "variants";
  variants: VariantDecl[];
  span: Span;
}

export interface VariantDecl {
  name: string;
  nameSpan: Span;
  values: VariantValue[];
  span: Span;
}

export interface VariantValue {
  name: string;
  nameSpan: Span;
  body: StyleBody;
  span: Span;
}

export interface DefaultsBlock {
  kind: "defaults";
  entries: DefaultEntry[];
  span: Span;
}

export interface DefaultEntry {
  variant: string;
  variantSpan: Span;
  value: string;
  valueSpan: Span;
  span: Span;
}

export interface CompoundBlock {
  kind: "compound";
  matchers: DefaultEntry[];
  slots: SlotBlock[];
  span: Span;
}

// --- style content -------------------------------------------------------

/** Body of `base` / variant values: bare items target the `root` slot. */
export interface StyleBody {
  items: (StyleItem | SlotBlock)[];
}

export interface SlotBlock {
  kind: "slotblock";
  name: string;
  nameSpan: Span;
  items: StyleItem[];
  span: Span;
}

export type StyleItem = Declaration | UseStmt | StateBlock | AtRule;

export interface Declaration {
  kind: "decl";
  property: string;
  /** Span of the property name alone (diagnostics target it precisely). */
  propertySpan: Span;
  value: RawValue;
  span: Span;
}

export interface UseStmt {
  kind: "use";
  recipe: string;
  recipeSpan: Span;
  span: Span;
}

export interface StateBlock {
  kind: "state";
  /**
   * Selector suffixes appended to the owning class — one per comma-separated
   * part of `&:hover, &:focus { … }`. A leading space marks a descendant
   * (`& .child` → " .child"); combinators are preserved (`& > svg` → " > svg").
   */
  selectors: string[];
  items: Declaration[];
  /** Slot sub-blocks for cross-slot styling: `&:hover { icon { … } }` targets
   *  the icon slot while the root carries the state ("group hover"). Only
   *  valid where slots are known (base / variant bodies). */
  slots: SlotBlock[];
  span: Span;
}

// --- values --------------------------------------------------------------

export interface RawValue {
  /** Original source text of the value. */
  text: string;
  /** Whitespace/comma separated words; candidate token refs pre-classified. */
  words: ValueWord[];
  span: Span;
}

export type ValueWord =
  | { kind: "literal"; text: string; span: Span }
  | { kind: "ref"; text: string; group: string; name: string; span: Span };

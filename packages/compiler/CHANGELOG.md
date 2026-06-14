# @arviahq/compiler

## 2.0.1

## 2.0.0

### Major Changes

- 7291b82: Remove `keyframes`, `responsive` and `container` constructs in favor of raw CSS at-rule pass-through

  The dedicated `keyframes NAME { … }` (top-level) and `responsive { … }` / `container { … }` (component) blocks are gone. Instead, any raw CSS at-rule — `@keyframes`, `@media`, `@container`, `@supports`, `@layer`, … — can now be written **nested anywhere** (in `base`, a slot, a variant value, `global`, or at the top level) and is emitted verbatim.

  **Breaking changes**

  - `keyframes pulse { … }` → `@keyframes pulse { … }`. Names are now literal (no hashing) and `@keyframes` bodies pass through untouched. References change from `animation: keyframes.pulse …` to `animation: pulse …`; the `keyframes.*` value-ref group is removed.
  - `responsive { md { size: lg } }` and `container { wide { layout: row } }` are removed along with all per-breakpoint variant switching (including the call-site object form `Button({ size: { initial, md } })`). Variant props are now plain string unions. Express responsiveness with a nested `@media`/`@container` instead.
  - Arvia no longer injects `container-type: inline-size` — set it yourself on the element that hosts a `@container`.

  **At-rule preludes are raw CSS with token-ref inlining.** There is no range-operator sugar — write full CSS conditions and reference theme tokens by name; the ref inlines to its literal value (never `var()`, which is invalid in a condition): `@media (min-width: breakpoint.md)` → `@media (min-width: 768px)`, `@container (inline-size < container-size.wide)` → `@container (inline-size < 480px)`. Any condition with no refs passes through byte-for-byte, so every media/container feature (`max-height`, `orientation`, …) is available.

  **No reserved names.** `breakpoint`/`container-size` are ordinary theme token groups (you may use any names) — they emit `--arvia-*` vars and a `tokens` export like any group, and `breakpoint`/`container`/`container-size` are all usable as component/slot/style/variant names. (The intermediate reservation and `..` range diagnostics — ARV127/ARV128/ARV141/ARV145/ARV161/ARV165 — are gone; an unknown token ref in a prelude surfaces as ARV101.)

  **At-rule pass-through is now complete.** Blockless statement at-rules — `@import "x.css";`, `@charset "utf-8";`, `@namespace …;`, `@layer a, b, c;` — emit verbatim and are hoisted to the very top of the output (before `:root`). Descriptor at-rules (`@font-face`, `@property`, `@page`, `@counter-style`, `@font-feature-values`, `@viewport`) emit verbatim, including when nested inside a component, where their descriptors are no longer wrapped in the slot class. And `@layer` — like any at-rule — can wrap whole constructs: `@layer base { component Button { … } }` compiles `Button` and wraps its generated CSS in the layer chain, with its JS/types export unchanged. Only `component`/`style` may be nested, and only in top-level or `global` at-rules; the new ARV129 error guards illegal nesting (a `component`/`style` inside another component, recipe or style).

### Patch Changes

- 43731b8: Recognize all current CSS descriptor at-rules when emitting verbatim

  `@font-palette-values`, `@position-try` and `@view-transition` join the existing descriptor at-rules (`@font-face`, `@property`, `@page`, `@counter-style`, `@font-feature-values`) that emit verbatim instead of having their descriptors wrapped in the slot class when nested inside a component. As before, descriptor at-rules are cleanest at the top level or in `global`; any unknown/future at-rule written there already passes through unchanged.

## 1.0.0

### Major Changes

- 71a471b: Add semicolon syntax for name-only slot registration and revamp slots docs.
  - Register a slot with `icon;` instead of empty `icon {}`
  - Empty slot blocks are now a parse error; use the semicolon form or add rules inside `{ … }`
  - Slot blocks in `slots { }` can hold declarations, `use`, and `&` states (merged with rules in `base`, variants, and compound)
  - Tree-sitter grammar, VS Code snippet, and website docs/examples updated accordingly

## 0.7.0

### Minor Changes

- b6876fb: Emit `color-scheme` + `light-dark()` for `light | dark` themes.

  When a theme's modes are exactly `light | dark`, color tokens now compile to a
  single `light-dark(lightValue, darkValue)` declaration on `:root` with
  `color-scheme: light dark`, instead of being duplicated across `:root`,
  `@media (prefers-color-scheme: dark)`, and `[data-arvia-theme]` blocks. The
  theme follows the OS by default, the `data-arvia-theme` attribute just flips
  `color-scheme`, and native UA widgets (scrollbars, form controls, focus rings)
  follow the active scheme. Mode-varying tokens that aren't colors (e.g.
  `box-shadow`) keep their per-mode override blocks, and any other mode shape
  falls back to the previous four-block emission.

  This changes the generated CSS for existing light/dark themes. Requires a
  Baseline-2024 browser (Chrome 123+, Safari 17.5+, Firefox 120+) for
  `light-dark()`.

## 0.6.1

### Patch Changes

- ca59363: `responsive` and `container` heads now accept a `..` range operator. A bare breakpoint still means "from this width up" (`md` → `@media (min-width: …)`, unchanged), while `..lg` caps a change below a breakpoint (`@media (width < …)`) and `sm..lg` scopes it to a half-open `[lower, upper)` band (`@media (… <= width < …)`). Container queries use the same syntax against `inline-size`. Range bands are first-class, fully-typed prop keys too (e.g. `Button({ size: { initial: "sm", "sm..lg": "lg" } })`). The checker validates both endpoints (with did-you-mean fixes) and flags inverted same-unit ranges; existing `>=` output is byte-identical.
- fb38c22: Production builds now emit short, identifier-safe hashed class names (e.g. `.k3j9f1a2`) instead of the long readable form. Development builds keep the readable `Component_variant_value_slot_hash` names for debugging. The Vite plugin selects the mode automatically from `command === "build"`. Hashes are derived from the file path and structure (never style content), so the CSS-only HMR and determinism guarantees are unchanged, and `.d.ts` output is unaffected.

## 0.6.0

## 0.5.1

### Patch Changes

- b17ffdb: Update repository metadata for the GitHub org transfer to [arviahq/arvia](https://github.com/arviahq/arvia).

## 0.5.0

### Minor Changes

- 548b081: Stricter checking, a formatter, and a second wave of IDE features.

  **Compiler**
  - CSS validation in the checker (css-tree/mdn-data): ARV180 unknown property with did-you-mean quick fix, ARV181 value-syntax mismatch — both warnings, `css: false | 'names' | 'syntax'` to opt down. Values containing `var()`/`env()` or unresolved token refs are never judged.
  - Unused-code warnings: ARV171 unused component token, ARV172 unused file-local recipe (suppressed for the shared theme via the new `sharedEnvFile` option), ARV173 empty variant.
  - `formatArv`: canonical token-stream formatter that preserves comments and the source's single-line/multiline block decisions, and fails closed on any discrepancy.
  - Rule-level CSS source maps (`CompileResult.cssMap`), served through the vite plugin for devtools jump-to-source; `buildIR`/`emitCss` and the IR types are now public.

  **Language server**
  - Folding ranges, selection ranges, workspace symbols, document formatting, and semantic tokens (contextual slot/variant/token classification).
  - Compiled-CSS hover previews: hovering a component, slot, variant value, style, or keyframes name shows its generated CSS.
  - New browser-safe `@arviahq/language-server/browser` entry powering real completion, hovers, and color decorators in the website playground (no worker, no LSP transport).

  Also new (unpublished): a tree-sitter grammar (`packages/tree-sitter-arvia`) with Neovim setup docs, a Zed extension skeleton, and VS Code snippets in the `arvia` extension.

## 0.4.0

### Minor Changes

- 446dd84: Stronger types and richer IDE support for `.arv` files.

  **Compiler**
  - Variants without a `defaults` entry now emit **required** props (`tone: "a" | "b"` instead of `tone?:`), and the component function requires its props object when any variant is required. The responsive/container object form of a required variant requires `initial`. Omitting a no-default variant silently rendered an unstyled element before — add a `defaults` entry to make a variant optional again.
  - Theme-bearing files now export a typed `tokens` object: `import { tokens } from "./theme.arv"` gives `var(--arvia-…)` references (literal-typed) for moded themes and resolved literal values for single-mode themes, plus per-group unions like `ColorToken`. A component or style named `tokens` in a theme-bearing file is now an error (ARV125).
  - Did-you-mean diagnostics carry structured fix data (`Diagnostic.fix`), exported as `DiagnosticFix`.

  **Language server**
  - Find references: tokens, recipes, keyframes, variants, values and slots — including cross-file fan-out through the shared theme from either direction.
  - Quick fixes: one-keystroke did-you-mean corrections, "insert defaults block" on components with required variants, and "remove unused slot" (with new hint-level lints anchoring the latter two).

## 0.3.0

## 0.2.0

### Minor Changes

- cd2d964: First public release under the `@arviahq` scope.
  - Design system compiler for `.arv` files (tokens, recipes, components, styles)
  - Vite plugin with HMR and `arvia` CLI
  - TypeScript virtual types via `@arviahq/typescript-plugin`
  - Language Server for editor diagnostics, completion, hover, rename, and more
  - VS Code extension (`arviahq.arvia`)

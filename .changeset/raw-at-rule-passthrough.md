---
"@arviahq/compiler": major
"tree-sitter-arvia": major
---

Remove `keyframes`, `responsive` and `container` constructs in favor of raw CSS at-rule pass-through

The dedicated `keyframes NAME { … }` (top-level) and `responsive { … }` / `container { … }` (component) blocks are gone. Instead, any raw CSS at-rule — `@keyframes`, `@media`, `@container`, `@supports`, `@layer`, … — can now be written **nested anywhere** (in `base`, a slot, a variant value, `global`, or at the top level) and is emitted verbatim.

**Breaking changes**

- `keyframes pulse { … }` → `@keyframes pulse { … }`. Names are now literal (no hashing) and `@keyframes` bodies pass through untouched. References change from `animation: keyframes.pulse …` to `animation: pulse …`; the `keyframes.*` value-ref group is removed.
- `responsive { md { size: lg } }` and `container { wide { layout: row } }` are removed along with all per-breakpoint variant switching (including the call-site object form `Button({ size: { initial, md } })`). Variant props are now plain string unions. Express responsiveness with a nested `@media`/`@container` instead.
- Arvia no longer injects `container-type: inline-size` — set it yourself on the element that hosts a `@container`.

**At-rule preludes are raw CSS with token-ref inlining.** There is no range-operator sugar — write full CSS conditions and reference theme tokens by name; the ref inlines to its literal value (never `var()`, which is invalid in a condition): `@media (min-width: breakpoint.md)` → `@media (min-width: 768px)`, `@container (inline-size < container-size.wide)` → `@container (inline-size < 480px)`. Any condition with no refs passes through byte-for-byte, so every media/container feature (`max-height`, `orientation`, …) is available.

**No reserved names.** `breakpoint`/`container-size` are ordinary theme token groups (you may use any names) — they emit `--arvia-*` vars and a `tokens` export like any group, and `breakpoint`/`container`/`container-size` are all usable as component/slot/style/variant names. (The intermediate reservation and `..` range diagnostics — ARV127/ARV128/ARV141/ARV145/ARV161/ARV165 — are gone; an unknown token ref in a prelude surfaces as ARV101.)

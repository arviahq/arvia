---
"@arviahq/compiler": patch
---

Recognize all current CSS descriptor at-rules when emitting verbatim

`@font-palette-values`, `@position-try` and `@view-transition` join the existing descriptor at-rules (`@font-face`, `@property`, `@page`, `@counter-style`, `@font-feature-values`) that emit verbatim instead of having their descriptors wrapped in the slot class when nested inside a component. As before, descriptor at-rules are cleanest at the top level or in `global`; any unknown/future at-rule written there already passes through unchanged.

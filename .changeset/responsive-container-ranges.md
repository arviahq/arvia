---
"@arviahq/compiler": patch
---

`responsive` and `container` heads now accept a `..` range operator. A bare breakpoint still means "from this width up" (`md` → `@media (min-width: …)`, unchanged), while `..lg` caps a change below a breakpoint (`@media (width < …)`) and `sm..lg` scopes it to a half-open `[lower, upper)` band (`@media (… <= width < …)`). Container queries use the same syntax against `inline-size`. Range bands are first-class, fully-typed prop keys too (e.g. `Button({ size: { initial: "sm", "sm..lg": "lg" } })`). The checker validates both endpoints (with did-you-mean fixes) and flags inverted same-unit ranges; existing `>=` output is byte-identical.

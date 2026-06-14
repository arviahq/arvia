---
"@arviahq/compiler": major
---

Add semicolon syntax for name-only slot registration and revamp slots docs.

- Register a slot with `icon;` instead of empty `icon {}`
- Empty slot blocks are now a parse error; use the semicolon form or add rules inside `{ … }`
- Slot blocks in `slots { }` can hold declarations, `use`, and `&` states (merged with rules in `base`, variants, and compound)
- Tree-sitter grammar, VS Code snippet, and website docs/examples updated accordingly

; Arvia (.arv) highlight queries — nvim-treesitter capture names.

(comment) @comment

(string) @string
(doc_suffix (string) @string.documentation)

[
  "theme"
  "global"
  "component"
  "recipe"
  "keyframes"
  "style"
  "base"
  "slots"
  "variants"
  "defaults"
  "responsive"
  "container"
  "compound"
  "tokens"
  "use"
  "modes"
  "doc"
] @keyword

"&" @operator
"@" @punctuation.special
["|" "=" ":" ";"] @punctuation.delimiter
["{" "}"] @punctuation.bracket

(component_decl name: (identifier) @type)
(keyframes_decl name: (identifier) @type)
(recipe_decl name: (identifier) @function)
(style_decl name: (identifier) @constant)
(use_statement recipe: (identifier) @function)

(token_group name: (identifier) @module)
(token_entry name: (token_name) @constant)
(mode_block mode: (identifier) @attribute)
(modes_decl (identifier) @attribute)

(variant_decl name: (identifier) @type.definition)
(variant_value name: (token_name) @constant)
(setting variant: (identifier) @type.definition value: (token_name) @constant)
(conditional_entry key: (token_name) @constant)

(slots_block (slot_decl name: (identifier) @variable.member))
(slot_block name: (identifier) @variable.member)

(declaration property: (property_name) @property)
(raw_selector) @string.special

/**
 * Tree-sitter grammar for the Arvia design-system language (.arv).
 *
 * Two constructs are lexed by an external scanner (src/scanner.c), mirroring
 * the compiler's pull lexer: `raw_value` runs to an unnested `;`/`}`
 * (paren/string aware, stops before a `doc "…"` suffix) and `raw_selector`
 * runs to `{`. Values are opaque in v1 — token refs inside them are
 * highlighted by query regexes, not sub-tokenized.
 */

/// <reference types="tree-sitter-cli/dsl" />

module.exports = grammar({
  name: "arvia",

  externals: ($) => [$.raw_value, $.raw_selector],
  extras: ($) => [/\s/, $.comment],
  word: ($) => $.identifier,

  rules: {
    source_file: ($) =>
      repeat(
        choice(
          $.theme_block,
          $.global_block,
          $.component_decl,
          $.recipe_decl,
          $.style_decl,
          $.at_rule,
        ),
      ),

    comment: () => token(choice(seq("//", /[^\n]*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"))),

    // --- theme ------------------------------------------------------------

    theme_block: ($) => seq("theme", "{", optional($.modes_decl), repeat($.token_group), "}"),

    modes_decl: ($) => seq("modes", ":", $.identifier, repeat(seq("|", $.identifier)), ";"),

    token_group: ($) =>
      seq(field("name", $.identifier), "{", repeat(choice($.token_entry, $.mode_block)), "}"),

    token_entry: ($) =>
      seq(field("name", $.token_name), "=", $.raw_value, optional($.doc_suffix), ";"),

    doc_suffix: ($) => seq("doc", $.string),

    mode_block: ($) => seq("@", field("mode", $.identifier), "{", repeat($.token_entry), "}"),

    // --- global -------------------------------------------------------------

    global_block: ($) => seq("global", "{", repeat(choice($.global_rule, $.at_rule)), "}"),
    global_rule: ($) => seq($.raw_selector, "{", repeat($.declaration), "}"),

    // --- at-rules -----------------------------------------------------------

    // Raw CSS at-rules (@media, @keyframes, @container, @supports, …) emitted
    // verbatim. The prelude (a raw condition or token ref) is opaque. Two forms:
    // a block `@name … { … }` and a statement `@import "x.css";` (raw_value
    // runs to `;`). A block body holds raw CSS — Arvia constructs nested in an
    // at-rule (`@layer base { component X { … } }`) are valid and compiled, but
    // for highlighting they parse as generic nested rules.
    at_rule: ($) =>
      seq(
        "@",
        field("name", $.identifier),
        choice(
          seq(optional(field("prelude", $.raw_selector)), "{", repeat($._at_body_item), "}"),
          seq(optional(field("prelude", $.raw_value)), ";"),
        ),
      ),
    _at_body_item: ($) => choice($.declaration, $.at_rule, $.at_nested_rule),
    at_nested_rule: ($) => seq($.raw_selector, "{", repeat($._at_body_item), "}"),

    // --- recipes / styles ----------------------------------------------------

    recipe_decl: ($) => seq("recipe", field("name", $.identifier), "{", repeat($._style_item), "}"),
    style_decl: ($) => seq("style", field("name", $.identifier), "{", repeat($._style_item), "}"),

    // --- components -----------------------------------------------------------

    component_decl: ($) =>
      seq("component", field("name", $.identifier), "{", repeat($._component_item), "}"),

    _component_item: ($) =>
      choice(
        $.base_block,
        $.slots_block,
        $.variants_block,
        $.defaults_block,
        $.compound_block,
        $.tokens_block,
        $.use_statement,
        $.declaration,
        $.at_rule,
      ),

    base_block: ($) => seq("base", "{", repeat($._body_item), "}"),

    slots_block: ($) => seq("slots", "{", repeat($.slot_decl), "}"),
    slot_decl: ($) =>
      choice(
        seq(field("name", $.identifier), ";"),
        seq(field("name", $.identifier), "{", repeat1($._style_item), "}"),
      ),

    variants_block: ($) => seq("variants", "{", repeat($.variant_decl), "}"),
    variant_decl: ($) => seq(field("name", $.identifier), "{", repeat($.variant_value), "}"),
    variant_value: ($) => seq(field("name", $.token_name), "{", repeat($._body_item), "}"),

    defaults_block: ($) => seq("defaults", "{", repeat($.setting), "}"),
    setting: ($) => seq(field("variant", $.identifier), ":", field("value", $.token_name), ";"),

    compound_block: ($) => seq("compound", "{", repeat(choice($.setting, $.slot_block)), "}"),

    tokens_block: ($) => seq("tokens", "{", repeat($.token_group), "}"),

    use_statement: ($) => seq("use", field("recipe", $.identifier), ";"),

    // --- style bodies -----------------------------------------------------------

    // base / variant value bodies: declarations, use, states, slot blocks, at-rules.
    _body_item: ($) =>
      choice($.declaration, $.use_statement, $.state_block, $.slot_block, $.at_rule),
    // recipe/style/slot bodies: no nested slot blocks.
    _style_item: ($) => choice($.declaration, $.use_statement, $.state_block, $.at_rule),

    slot_block: ($) => seq(field("name", $.identifier), "{", repeat($._style_item), "}"),

    state_block: ($) =>
      seq("&", $.raw_selector, "{", repeat(choice($.declaration, $.slot_block)), "}"),

    declaration: ($) =>
      seq(field("property", alias($.identifier, $.property_name)), ":", $.raw_value, ";"),

    // --- terminals -----------------------------------------------------------

    /** One terminal for names AND properties (they collide lexically in style
     *  bodies); leading dashes cover custom properties and vendor prefixes. */
    identifier: () => /-{0,2}[A-Za-z_][A-Za-z0-9_-]*/,
    /** Token names may be digit-led (`space { 1 = 4px; }`, `2xl`). */
    token_name: () => /[A-Za-z0-9_][A-Za-z0-9_-]*/,
    string: () => token(choice(seq('"', /([^"\\]|\\.)*/, '"'), seq("'", /([^'\\]|\\.)*/, "'"))),
  },
});

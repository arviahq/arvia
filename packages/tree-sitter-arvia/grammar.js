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
          $.keyframes_decl,
          $.style_decl,
        ),
      ),

    comment: () => token(choice(seq("//", /[^\n]*/), seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"))),

    // --- theme ------------------------------------------------------------

    theme_block: ($) =>
      seq("theme", "{", optional($.modes_decl), repeat($.token_group), "}"),

    modes_decl: ($) =>
      seq("modes", ":", $.identifier, repeat(seq("|", $.identifier)), ";"),

    token_group: ($) =>
      seq(field("name", $.identifier), "{", repeat(choice($.token_entry, $.mode_block)), "}"),

    token_entry: ($) =>
      seq(field("name", $.token_name), "=", $.raw_value, optional($.doc_suffix), ";"),

    doc_suffix: ($) => seq("doc", $.string),

    mode_block: ($) =>
      seq("@", field("mode", $.identifier), "{", repeat($.token_entry), "}"),

    // --- global / keyframes -------------------------------------------------

    global_block: ($) => seq("global", "{", repeat($.global_rule), "}"),
    global_rule: ($) => seq($.raw_selector, "{", repeat($.declaration), "}"),

    keyframes_decl: ($) =>
      seq("keyframes", field("name", $.identifier), "{", repeat($.keyframe_step), "}"),
    keyframe_step: ($) => seq($.raw_selector, "{", repeat($.declaration), "}"),

    // --- recipes / styles ----------------------------------------------------

    recipe_decl: ($) =>
      seq("recipe", field("name", $.identifier), "{", repeat($._style_item), "}"),
    style_decl: ($) =>
      seq("style", field("name", $.identifier), "{", repeat($._style_item), "}"),

    // --- components -----------------------------------------------------------

    component_decl: ($) =>
      seq("component", field("name", $.identifier), "{", repeat($._component_item), "}"),

    _component_item: ($) =>
      choice(
        $.base_block,
        $.slots_block,
        $.variants_block,
        $.defaults_block,
        $.responsive_block,
        $.container_block,
        $.compound_block,
        $.tokens_block,
        $.use_statement,
        $.declaration,
      ),

    base_block: ($) => seq("base", "{", repeat($._body_item), "}"),

    slots_block: ($) => seq("slots", "{", repeat($.slot_decl), "}"),
    slot_decl: ($) =>
      seq(field("name", $.identifier), "{", repeat($._style_item), "}"),

    variants_block: ($) => seq("variants", "{", repeat($.variant_decl), "}"),
    variant_decl: ($) =>
      seq(field("name", $.identifier), "{", repeat($.variant_value), "}"),
    variant_value: ($) =>
      seq(field("name", $.token_name), "{", repeat($._body_item), "}"),

    defaults_block: ($) => seq("defaults", "{", repeat($.setting), "}"),
    setting: ($) =>
      seq(field("variant", $.identifier), ":", field("value", $.token_name), ";"),

    responsive_block: ($) => seq("responsive", "{", repeat($.conditional_entry), "}"),
    container_block: ($) => seq("container", "{", repeat($.conditional_entry), "}"),
    conditional_entry: ($) =>
      seq(field("key", $.token_name), "{", repeat($.setting), "}"),

    compound_block: ($) =>
      seq("compound", "{", repeat(choice($.setting, $.slot_block)), "}"),

    tokens_block: ($) => seq("tokens", "{", repeat($.token_group), "}"),

    use_statement: ($) => seq("use", field("recipe", $.identifier), ";"),

    // --- style bodies -----------------------------------------------------------

    // base / variant value bodies: declarations, use, states and slot blocks.
    _body_item: ($) => choice($.declaration, $.use_statement, $.state_block, $.slot_block),
    // recipe/style/slot bodies: no nested slot blocks.
    _style_item: ($) => choice($.declaration, $.use_statement, $.state_block),

    slot_block: ($) =>
      seq(field("name", $.identifier), "{", repeat($._style_item), "}"),

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

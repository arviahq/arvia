import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function diagnostics(): DocSection {
  return {
    title: fbt("Diagnostics reference", "Docs page title — Diagnostics reference"),
    slug: "diagnostics",
    description: fbt(
      "Every ARV code the compiler can emit, what it means, and how to fix it.",
      "Docs page description — Diagnostics reference.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Arvia diagnostics are numbered by area, carry a severity, and where possible a did-you-mean hint with a structured fix your editor can apply in one action. Errors stop the compiler from emitting CSS/JS/types for that file; warnings compile normally. The same codes appear everywhere — build output, editor squiggles, and `arvia gen`.",
          "Docs content — diagnostics: opening",
        ),
      },
      { type: "h2", text: fbt("Syntax (ARV001–ARV010)", "Docs content — heading: diag syntax") },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV001",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Unexpected character — something the lexer cannot start a token with.",
              "Docs table cell — diag 001",
            ),
          ],
          [
            "ARV002",
            fbt("error", "Docs table cell — severity error"),
            fbt("Unterminated `/* … */` block comment.", "Docs table cell — diag 002"),
          ],
          [
            "ARV003",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Bad declaration value: an unterminated string, or no value before the `;`.",
              "Docs table cell — diag 003",
            ),
          ],
          [
            "ARV004",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Malformed selector — missing `{` after it, or a `{` with no selector before it.",
              "Docs table cell — diag 004",
            ),
          ],
          [
            "ARV010",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "General parse error — unexpected token for the current construct. The message names exactly what was expected; the parser recovers and keeps checking the rest of the file.",
              "Docs table cell — diag 010",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("Names & references (ARV101–ARV103)", "Docs content — heading: diag refs"),
      },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV101",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Unknown token reference (`color.primry`) — only fires for known theme groups, so ordinary dotted CSS values pass. Comes with a did-you-mean fix. Also used for forward references between theme tokens: define before use.",
              "Docs table cell — diag 101",
            ),
          ],
          [
            "ARV102",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "`use` names a recipe that does not exist. The hint tells you when the name is actually a style — styles cannot be `use`d.",
              "Docs table cell — diag 102",
            ),
          ],
          [
            "ARV103",
            fbt("error", "Docs table cell — severity error"),
            fbt("Recipe cycle — A uses B uses A.", "Docs table cell — diag 103"),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("Duplicates & naming (ARV110–ARV119)", "Docs content — heading: diag dup"),
      },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV110",
            fbt("error", "Docs table cell — severity error"),
            fbt("Duplicate component name in one file.", "Docs table cell — diag 110"),
          ],
          [
            "ARV111",
            fbt("error", "Docs table cell — severity error"),
            fbt("Duplicate recipe name in one file.", "Docs table cell — diag 111"),
          ],
          [
            "ARV112",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Duplicate theme group, token, breakpoint, or container size — each value has exactly one home per file.",
              "Docs table cell — diag 112",
            ),
          ],
          [
            "ARV113",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Duplicate slot, including redeclaring the implicit `root`.",
              "Docs table cell — diag 113",
            ),
          ],
          [
            "ARV114",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Duplicate variant axis or duplicate value within an axis.",
              "Docs table cell — diag 114",
            ),
          ],
          [
            "ARV115",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Duplicate section block — a component allows one `base`, one `slots`, etc.",
              "Docs table cell — diag 115",
            ),
          ],
          [
            "ARV116",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Component or style name is not a valid JavaScript identifier (they become exports).",
              "Docs table cell — diag 116",
            ),
          ],
          [
            "ARV117",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Duplicate style name, or a style clashing with a component name.",
              "Docs table cell — diag 117",
            ),
          ],
          [
            "ARV118",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Duplicate local token inside a component `tokens` block.",
              "Docs table cell — diag 118",
            ),
          ],
          [
            "ARV119",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Mode override inside component tokens — local tokens are compile-time constants; moded values belong in the theme.",
              "Docs table cell — diag 119",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("Component structure (ARV120–ARV126)", "Docs content — heading: diag component"),
      },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV120",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "A sub-block targets a slot the component never declared. Did-you-mean fix included.",
              "Docs table cell — diag 120",
            ),
          ],
          [
            "ARV121",
            fbt("error", "Docs table cell — severity error"),
            fbt("Compound matcher names an unknown variant axis.", "Docs table cell — diag 121"),
          ],
          [
            "ARV122",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Compound matcher names an unknown value for a known axis.",
              "Docs table cell — diag 122",
            ),
          ],
          [
            "ARV123",
            fbt("warning", "Docs table cell — severity warning"),
            fbt(
              "Empty compound — no matchers or no styles. Compilation continues; the block does nothing.",
              "Docs table cell — diag 123",
            ),
          ],
          [
            "ARV124",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "`defaults` references an unknown variant or value. Fix included.",
              "Docs table cell — diag 124",
            ),
          ],
          [
            "ARV125",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "A component or style named `tokens` in a file that exports theme tokens — it would collide with the `tokens` export.",
              "Docs table cell — diag 125",
            ),
          ],
          [
            "ARV126",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "The same variant matched twice in one compound block.",
              "Docs table cell — diag 126",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("Theme modes (ARV130–ARV136)", "Docs content — heading: diag modes"),
      },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV130",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "A `modes:` declaration in a regular file conflicts with the shared theme's modes — modes are declared once, in the theme file.",
              "Docs table cell — diag 130",
            ),
          ],
          [
            "ARV131",
            fbt("error", "Docs table cell — severity error"),
            fbt("`modes:` lists fewer than two mode names.", "Docs table cell — diag 131"),
          ],
          [
            "ARV132",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "`@mode` override for a mode that is not in the `modes:` list.",
              "Docs table cell — diag 132",
            ),
          ],
          [
            "ARV133",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Mode override for a token that has no base declaration — declare the token first.",
              "Docs table cell — diag 133",
            ),
          ],
          [
            "ARV134",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "`@mode` override used without any `modes:` declaration.",
              "Docs table cell — diag 134",
            ),
          ],
          [
            "ARV135",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Mode override on a breakpoint token — breakpoints cannot vary per mode.",
              "Docs table cell — diag 135",
            ),
          ],
          [
            "ARV136",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Mode override on a container size token — same rule as breakpoints.",
              "Docs table cell — diag 136",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt(
          "Responsive & containers (ARV140–ARV144, ARV160–ARV164)",
          "Docs content — heading: diag queries",
        ),
      },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV140 / ARV160",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Duplicate breakpoint (or container size) entry in one `responsive` / `container` block.",
              "Docs table cell — diag 140",
            ),
          ],
          [
            "ARV141 / ARV161",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Unknown breakpoint or container size — declare them in `theme { breakpoint { … } }` / `theme { container { … } }`.",
              "Docs table cell — diag 141",
            ),
          ],
          [
            "ARV142 / ARV162",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "The same variant overridden twice at one breakpoint / container size.",
              "Docs table cell — diag 142",
            ),
          ],
          [
            "ARV143 / ARV163",
            fbt("error", "Docs table cell — severity error"),
            fbt("Override references an unknown variant axis.", "Docs table cell — diag 143"),
          ],
          [
            "ARV144 / ARV164",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "Override references an unknown value for a known axis.",
              "Docs table cell — diag 144",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("Keyframes (ARV150–ARV151)", "Docs content — heading: diag keyframes"),
      },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV150",
            fbt("error", "Docs table cell — severity error"),
            fbt("Duplicate `keyframes` name in one file.", "Docs table cell — diag 150"),
          ],
          [
            "ARV151",
            fbt("error", "Docs table cell — severity error"),
            fbt(
              "`keyframes.name` reference to an animation that does not exist. Did-you-mean hint included.",
              "Docs table cell — diag 151",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("Unused declarations (ARV171–ARV173)", "Docs content — heading: diag unused"),
      },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV171",
            fbt("warning", "Docs table cell — severity warning"),
            fbt(
              "A component-local token nothing references — provably dead, since locals have one consumer.",
              "Docs table cell — diag 171",
            ),
          ],
          [
            "ARV172",
            fbt("warning", "Docs table cell — severity warning"),
            fbt(
              "A file-local recipe nothing uses. Suppressed for the shared theme file, whose consumers live elsewhere.",
              "Docs table cell — diag 172",
            ),
          ],
          [
            "ARV173",
            fbt("warning", "Docs table cell — severity warning"),
            fbt("A variant axis with no values.", "Docs table cell — diag 173"),
          ],
        ],
      },
      { type: "h2", text: fbt("CSS checks (ARV180–ARV181)", "Docs content — heading: diag css") },
      {
        type: "table",
        headers: [
          "Code",
          fbt("Severity", "Docs table header — severity"),
          fbt("Meaning", "Docs table header — diag meaning"),
        ],
        rows: [
          [
            "ARV180",
            fbt("warning", "Docs table cell — severity warning"),
            fbt(
              "Unknown CSS property name (`colr:`) — custom properties (`--x`) are exempt. Did-you-mean fix included.",
              "Docs table cell — diag 180",
            ),
          ],
          [
            "ARV181",
            fbt("warning", "Docs table cell — severity warning"),
            fbt(
              "Value doesn't match the property's expected syntax (`display: 12px`). Skipped for values containing `var()` and unresolved refs, and tolerates `!important`.",
              "Docs table cell — diag 181",
            ),
          ],
        ],
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          'The CSS checks are configurable when you call the compiler yourself: `css: "names"` keeps property-name checks but skips value syntax, `css: false` disables both. The Vite plugin runs them in full.',
          "Docs note — diagnostics: css option",
        ),
      },
    ],
  };
}

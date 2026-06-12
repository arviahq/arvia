import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function compound(): DocSection {
  return {
    title: fbt("Compound variants", "Docs page title — Compound variants"),
    slug: "compound",
    description: fbt(
      "Styles that apply only when several variant values line up.",
      "Docs page description — Styles that apply when multiple variants match.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Variant axes are independent by design — but sometimes a combination needs its own treatment. A small danger button might need extra weight; a selected row that is also disabled needs muting. Compound blocks express exactly that: matchers naming variant values, plus slot styles that apply only when every matcher holds:",
          "Docs content — compound: opening",
        ),
      },
      {
        type: "code",
        code: `component Button {
  variants {
    size { sm { padding: space.1 space.3; } lg { padding: space.3 space.5; } }
    tone { primary { background: color.primary; } danger { background: color.danger; } }
  }
  defaults { size: lg; tone: primary; }

  compound {
    size: sm;
    tone: danger;

    root {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Matchers (size: sm;) and slot blocks (root { … }) share the compound body — the parser tells them apart by punctuation. A compound adds no props and no new API; it refines what existing props produce.",
          "Docs content — compound: syntax semantics",
        ),
      },
      { type: "h2", text: fbt("Matching semantics", "Docs content — heading: matching semantics") },
      {
        type: "p",
        text: fbt(
          "At runtime, the generated function evaluates each variant to its effective value — the prop if passed, otherwise the default — and applies a compound's classes when all of its matchers equal those effective values. Defaults count: Button() with defaults size: sm, tone: danger does trigger the compound above without any props.",
          "Docs content — compound: matching against defaults",
        ),
      },
      {
        type: "code",
        label: "what a call returns",
        lang: "js",
        code: `Button({ size: "sm", tone: "danger" }).root
// "Button_root_… Button_size_sm_root_… Button_tone_danger_root_…
//  Button_size_sm_tone_danger_root_…"   ← the compound class

Button({ size: "sm" }).root
// no compound class — tone resolves to its default "primary"`,
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "With responsive object props, compounds match the static value — the initial entry (or default). A variant that only becomes sm at a breakpoint does not flip compounds on and off mid-media-query; combination styling stays predictable.",
          "Docs note — compound: responsive matching",
        ),
      },
      { type: "h2", text: fbt("Pushing it further", "Docs content — heading: pushing further") },
      {
        type: "p",
        text: fbt(
          "Compounds compose along every dimension the language has. Multiple `compound` blocks stack — each matching one applies, in source order. A compound can match three or more axes, style several slots at once, and carry states:",
          "Docs content — compound: pushing lead-in",
        ),
      },
      {
        type: "code",
        code: `component Row {
  slots { root {} title {} check {} }

  variants {
    selected { yes { background: color.primary; } no {} }
    state    { enabled {} disabled { opacity: 0.6; } }
    density  { normal {} compact { padding: space.1; } }
  }
  defaults { selected: no; state: enabled; density: normal; }

  // selected rows get a visible check
  compound {
    selected: yes;
    state: enabled;
    check { opacity: 1; }
  }

  // selected + disabled: muted, not vivid
  compound {
    selected: yes;
    state: disabled;

    root { background: color.border; }
    title { color: color.muted; }
    check { opacity: 0.4; }
  }

  // three-axis: compact selected rows tighten the title too
  compound {
    selected: yes;
    density: compact;
    title { font-size: font.sm; }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "A row that is selected, disabled, and compact matches the second and third blocks simultaneously and receives both class sets. Think of compounds as additive patches over the variant grid, not branches of an if/else.",
          "Docs content — compound: additive patches",
        ),
      },
      {
        type: "code",
        label: "states inside a compound slot",
        code: `compound {
  size: sm;
  tone: danger;

  root {
    font-weight: 700;
    &:hover { filter: brightness(1.1); }   // hover, only for sm + danger
  }
}`,
      },
      { type: "h2", text: fbt("Cascade position", "Docs content — heading: compound cascade") },
      {
        type: "p",
        text: fbt(
          "Compound classes are emitted after base and variant classes in the stylesheet and have the same single-class specificity — so when a compound and a variant set the same property, the compound wins. That ordering is the entire mechanism; there is no specificity arms race.",
          "Docs content — compound: cascade",
        ),
      },
      {
        type: "h2",
        text: fbt("Checked, like everything else", "Docs content — heading: compound checks"),
      },
      {
        type: "table",
        headers: [
          fbt("Mistake", "Docs table header — mistake"),
          fbt("Diagnostic", "Docs table header — diagnostic"),
        ],
        rows: [
          [
            fbt("Matcher names a variant the component lacks", "Docs table cell — compound err1"),
            "ARV121",
          ],
          [
            fbt("Matcher names a value the axis lacks", "Docs table cell — compound err2"),
            "ARV122",
          ],
          [
            fbt("Same variant matched twice in one block", "Docs table cell — compound err3"),
            "ARV126",
          ],
          [
            fbt("Empty compound (no matchers or no styles)", "Docs table cell — compound err4"),
            fbt(
              "ARV123 — a warning; compilation continues.",
              "Docs table cell — compound err4 result",
            ),
          ],
        ],
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "If you keep writing the same pair of matchers, that pair probably wants to be a real axis. Compounds shine for exceptions; when a combination is the rule, model it directly as a variant.",
          "Docs note — compound: when to promote",
        ),
      },
    ],
  };
}

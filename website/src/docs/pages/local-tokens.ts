import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function localTokens(): DocSection {
  return {
    title: fbt("Local tokens", "Docs page title — Local tokens"),
    slug: "local-tokens",
    description: fbt(
      "Component-scoped values that shadow the theme.",
      "Docs page description — Component-scoped tokens that shadow the theme.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Some values matter to exactly one component: a chip's pill radius, a toolbar's precise height. A `tokens` block inside a component names those values without polluting the global theme:",
          "Docs content — local tokens: opening",
        ),
      },
      {
        type: "code",
        label: "chip.arv",
        code: `component Chip {
  tokens {
    space { pad = 6px; }
    metrics { radius = 999px; }
  }

  base {
    padding: space.pad space.2;   // local pad, theme space.2
    border-radius: metrics.radius;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "References use the exact same group.name syntax — there is no separate way to write a local reference. Resolution checks the component's tokens first, then the file's `theme` block, then the shared theme. In the example, `space.pad` finds the local value while `space.2` falls through to the theme: one component can mix both in a single declaration.",
          "Docs content — local tokens: resolution order",
        ),
      },
      { type: "h2", text: fbt("Shadowing", "Docs content — heading: shadowing") },
      {
        type: "p",
        text: fbt(
          "Because local groups win lookups, redefining an existing theme token changes what it means inside this component only:",
          "Docs content — local tokens: shadowing lead-in",
        ),
      },
      {
        type: "code",
        code: `theme { space { 2 = 8px; } }

component Dense {
  tokens { space { 2 = 4px; } }   // tighter, here only
  base { gap: space.2; }           // 4px
}

component Normal {
  base { gap: space.2; }           // 8px — no leak
}`,
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "Shadowing a theme token is powerful and easy to over-use — a reader seeing `space.2` will assume the theme value. Prefer a new name (`space.dense`) unless the component genuinely reinterprets the scale.",
          "Docs note — local tokens: shadowing caution",
        ),
      },
      {
        type: "h2",
        text: fbt("Compile-time constants", "Docs content — heading: compile-time constants"),
      },
      {
        type: "p",
        text: fbt(
          "Local tokens are always inlined to literal values — even when the theme has modes and global tokens compile to CSS variables. They never become custom properties, never appear in the tokens export or the token catalog, and accept no `@mode` overrides (mode-dependent values belong in the theme). They resolve everywhere a value can appear, including `calc()` and state blocks:",
          "Docs content — local tokens: constants semantics",
        ),
      },
      {
        type: "code",
        code: `component Chip {
  tokens { metrics { gap = 4px; } }

  base {
    margin: calc(metrics.gap * 3);   // calc(4px * 3)
    &:hover { margin: metrics.gap; } // 4px
  }

  variants {
    size {
      lg { padding: calc(metrics.gap * 2); }
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "A local token that nothing references is flagged (ARV171) — local values have exactly one consumer, so an unused one is dead weight the checker can prove.",
          "Docs content — local tokens: unused warning",
        ),
      },
      { type: "h2", text: fbt("Local or theme?", "Docs content — heading: local or theme") },
      {
        type: "table",
        headers: [
          fbt("Signal", "Docs table header — signal"),
          fbt("Put it in", "Docs table header — put it in"),
        ],
        rows: [
          [
            fbt("Two or more components need it", "Docs table cell — signal shared"),
            fbt(
              "Theme — that is the definition of a design token.",
              "Docs table cell — answer theme",
            ),
          ],
          [
            fbt("It should flip with dark mode", "Docs table cell — signal moded"),
            fbt(
              "Theme — only theme tokens take `@mode` overrides.",
              "Docs table cell — answer theme moded",
            ),
          ],
          [
            fbt("It is a magic number with a meaning, used once", "Docs table cell — signal magic"),
            fbt("Component tokens — named, scoped, inlined.", "Docs table cell — answer local"),
          ],
          [
            fbt("Designers should see it in the token catalog", "Docs table cell — signal catalog"),
            fbt(
              "Theme — local tokens are invisible to tooling by design.",
              "Docs table cell — answer theme catalog",
            ),
          ],
        ],
      },
    ],
  };
}

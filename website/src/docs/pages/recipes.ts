import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function recipes(): DocSection {
  return {
    title: fbt("Recipes & use", "Docs page title — Recipes & use"),
    slug: "recipes",
    description: fbt(
      "Reusable style fragments, and the use keyword that composes them — no imports required.",
      "Docs page description — Reusable style fragments composed with use.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "A recipe is a named fragment of declarations that other styles pull in with use. Recipes are Arvia's composition primitive: they produce no CSS and no exports on their own — they only exist flattened into whatever consumes them.",
          "Docs content — recipes: opening",
        ),
      },
      {
        type: "code",
        code: `recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.primary;
    outline-offset: 2px;
  }
}

component Button {
  base {
    use FocusRing;
    padding: space.2 space.4;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Recipes hold declarations, &-state blocks, and use statements. They cannot declare variants, slots, or local tokens — a recipe is a fragment, not a component. If one grows in that direction, promote it.",
          "Docs content — recipes: what they hold",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "Implicit availability through the theme",
          "Docs content — heading: implicit import",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Recipes declared in your shared theme file are available to every .arv file in the project — use FocusRing simply works, with no import statement. This is the same ambient-environment mechanism that makes tokens global: the theme is compiled first, and its recipes ride along.",
          "Docs content — recipes: theme env",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `recipe Surface {
  background: color.surface;
  border: 1px solid color.border;
  border-radius: radius.lg;
}`,
      },
      {
        type: "code",
        label: "src/card.arv — no import needed",
        code: `component Card {
  use Surface;
  padding: space.5;
}`,
      },
      {
        type: "p",
        text: fbt(
          "Recipes declared in any other file are local to that file. A local recipe that nothing uses earns a warning (ARV172) — in the shared theme file the warning is suppressed, since its consumers live elsewhere.",
          "Docs content — recipes: locality and unused",
        ),
      },
      {
        type: "h2",
        text: fbt("Where use is allowed", "Docs content — heading: where use allowed"),
      },
      {
        type: "table",
        headers: [
          fbt("Location", "Docs table header — location"),
          fbt("Example", "Docs table header — example"),
        ],
        rows: [
          [
            fbt("Component top level (targets root)", "Docs table cell — use component level"),
            "component Card { use Surface; }",
          ],
          [fbt("Inside base", "Docs table cell — use in base"), "base { use FocusRing; }"],
          [fbt("Inside a slot block", "Docs table cell — use in slot"), "icon { use IconReset; }"],
          [
            fbt("Inside a variant value", "Docs table cell — use in variant"),
            "danger { use LoudText; }",
          ],
          [
            fbt("Inside another recipe", "Docs table cell — use in recipe"),
            "recipe Panel { use Surface; }",
          ],
          [fbt("Inside a style", "Docs table cell — use in style"), "style panel { use Surface; }"],
        ],
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "The one place use is not allowed is inside an &-state block — a recipe there would be ambiguous about which selector its own states attach to. Inline the declarations instead.",
          "Docs note — recipes: no use in states",
        ),
      },
      {
        type: "h2",
        text: fbt("Composition and ordering", "Docs content — heading: composition ordering"),
      },
      {
        type: "p",
        text: fbt(
          "use is textual inclusion: the recipe's declarations are flattened in at exactly the spot the use statement sits. Within one rule, later declarations win — so you override a recipe by writing after it:",
          "Docs content — recipes: ordering lead-in",
        ),
      },
      {
        type: "code",
        code: `recipe Rounded { border-radius: 8px; }

recipe Surface {
  use Rounded;
  border: 1px solid #e5e5e5;
  background: white;
}

component Card {
  use Surface;
  base {
    padding: 16px;
    background: #fafafa;   // wins over Surface's white — it comes later
  }
}`,
      },
      {
        type: "code",
        label: "generated CSS",
        lang: "css",
        code: `.Card_root_07xhee {
  border-radius: 8px;       /* Rounded, via Surface */
  border: 1px solid #e5e5e5;/* Surface */
  background: white;        /* Surface */
  padding: 16px;            /* Card */
  background: #fafafa;      /* Card — last one wins */
}`,
      },
      {
        type: "p",
        text: fbt(
          "Recipes nest to any depth, and the checker walks the chain: an unknown recipe is an error with a suggestion (ARV102), and a cycle — recipe A using B using A — is caught rather than looping forever (ARV103). State blocks flatten too: a recipe's &:hover merges with the consumer's other rules for the same selector.",
          "Docs content — recipes: nesting and checks",
        ),
      },
      {
        type: "h2",
        text: fbt("Building a recipe library", "Docs content — heading: recipe library"),
      },
      {
        type: "p",
        text: fbt(
          "Mature themes accumulate a small standard library of fragments. Good recipe candidates are cross-cutting and markup-free:",
          "Docs content — recipes: library lead-in",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.primary;
    outline-offset: 2px;
  }
}

recipe Interactive {
  use FocusRing;
  cursor: pointer;
  transition: opacity duration.fast, filter duration.fast;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

recipe Surface {
  background: color.surface;
  border: 1px solid color.border;
  border-radius: radius.lg;
}`,
      },
      {
        type: "p",
        text: fbt(
          "Note Interactive building on FocusRing: layered recipes let every button, link, and menu item in the system share one definition of “focusable, clickable thing” while each component keeps its own look.",
          "Docs content — recipes: layered library",
        ),
      },
      { type: "h2", text: fbt("Recipe or style?", "Docs content — heading: recipe or style") },
      {
        type: "p",
        text: fbt(
          "Both hold the same kind of content; the difference is the consumer. A recipe is for other .arv code — it vanishes into its users and emits nothing. A style is for your markup — it emits one class and exports its name. When a fragment needs to be applied directly to an element somewhere, give it a style (which can itself use the recipe).",
          "Docs content — recipes: vs style",
        ),
      },
    ],
  };
}

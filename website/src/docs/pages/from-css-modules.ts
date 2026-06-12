import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function fromCssModules(): DocSection {
  return {
    title: fbt("Coming from CSS Modules", "Docs page title — Coming from CSS Modules"),
    slug: "from-css-modules",
    description: fbt(
      "Keep the scoping you like; replace the conditional-className logic you don't.",
      "Docs page description — Migrating from CSS Modules.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "CSS Modules users already live the Arvia workflow: styles in a sibling file, scoped class names, an import that yields classes. What CSS Modules never had is knowledge of your design system — variants live in JS conditionals, tokens are unchecked `var()` strings, and `composes` is the whole composition story. That layer is exactly what Arvia adds:",
          "Docs content — cssm: opening",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("CSS Modules concept", "Docs table header — cssm concept"),
          fbt("Arvia equivalent", "Docs table header — cssm arvia equivalent"),
        ],
        rows: [
          [
            ".button { } in button.module.css",
            fbt("`component Button { }` in button.arv", "Docs table cell — cssm class arvia"),
          ],
          [
            "styles.button in JSX",
            fbt("`Button().root` — same idea, typed", "Docs table cell — cssm usage arvia"),
          ],
          [
            'composes: focusable from "./shared.css"',
            fbt(
              "`use Focusable;` — resolved through the shared theme, no path",
              "Docs table cell — cssm composes arvia",
            ),
          ],
          [
            ":global(.third-party) { }",
            fbt("`global { .third-party { } }`", "Docs table cell — cssm global arvia"),
          ],
          [
            "var(--space-2) + a variables.css",
            fbt(
              "`space.2` — checked, with did-you-mean fixes",
              "Docs table cell — cssm vars arvia",
            ),
          ],
          [
            fbt("clsx(styles.button, isLarge && styles.large)", "Docs table cell — cssm clsx"),
            fbt(
              '`Button({ size: "lg" })` — variants replace the conditional logic',
              "Docs table cell — cssm clsx arvia",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("The migration in one example", "Docs content — heading: cssm example"),
      },
      {
        type: "code",
        label: "card.module.css + Card.tsx (before)",
        lang: "css",
        code: `.card { border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
.cardSelected { border-color: var(--accent); }
.cardCompact { padding: 8px; }
.title { font-weight: 600; }

/* Card.tsx */
/* <div className={clsx(styles.card,
       selected && styles.cardSelected,
       compact && styles.cardCompact)}> */`,
      },
      {
        type: "code",
        label: "card.arv (after)",
        code: `component Card {
  slots {
    root {}
    title { font-weight: 600; }
  }

  base {
    border: 1px solid color.border;
    border-radius: radius.lg;
  }

  variants {
    selected {
      no {}
      yes { border-color: color.accent; }
    }
    density {
      normal { padding: space.5; }
      compact { padding: space.2; }
    }
  }

  defaults { selected: no; density: normal; }
}

// Card({ selected: selected ? "yes" : "no", density }).root`,
      },
      {
        type: "p",
        text: fbt(
          "The modifier-class pattern (`.cardSelected`, `.cardCompact`) becomes variants: the combination logic leaves your component code, misspelling a modifier becomes a type error, and the title's class arrives from the same call instead of a second `styles.title` lookup.",
          "Docs content — cssm: example explanation",
        ),
      },
      {
        type: "h2",
        text: fbt("What carries over unchanged", "Docs content — heading: cssm carries over"),
      },
      {
        type: "ul",
        items: [
          fbt(
            "The mental model: styles in files next to components, imported as named values, scoped by generated class names.",
            "Docs list item — cssm carry model",
          ),
          fbt(
            "Plain CSS knowledge — every declaration inside a block is ordinary CSS, and `&:hover` works like CSS nesting.",
            "Docs list item — cssm carry css",
          ),
          fbt(
            "Single classes without ceremony: a `style` declaration is the moral equivalent of one CSS Modules class (see [Styles](/docs/styles)).",
            "Docs list item — cssm carry styles",
          ),
        ],
      },
      { type: "h2", text: fbt("What to watch out for", "Docs content — heading: cssm gotchas") },
      {
        type: "ul",
        items: [
          fbt(
            "No descendant selectors between your own elements — `.card .title { }` becomes a `title` slot. Selectors that reach into markup you don't own stay possible via `& .child` states and `global`.",
            "Docs list item — cssm gotcha descendant",
          ),
          fbt(
            "Composition is by name, not by path: `use Surface` resolves through the [shared theme](/docs/recipes), so shared fragments live in theme.arv rather than an imported shared.css.",
            "Docs list item — cssm gotcha composes",
          ),
          fbt(
            "Media queries move from the stylesheet into [responsive](/docs/responsive) and [container](/docs/container-queries) blocks — declared per component, switching variants instead of raw properties.",
            "Docs list item — cssm gotcha media",
          ),
        ],
      },
    ],
  };
}

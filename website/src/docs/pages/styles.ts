import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function styles(): DocSection {
  return {
    title: fbt("Styles", "Docs page title — Styles"),
    slug: "styles",
    description: fbt(
      "Standalone exported classes — utilities without component ceremony.",
      "Docs page description — Standalone exported classes.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Not everything deserves a component. A `style` declaration compiles to exactly one hashed CSS class and exports its name as a plain string constant — the right tool for one-off utilities, layout helpers, and page-level styling:",
          "Docs content — styles: opening",
        ),
      },
      {
        type: "code",
        label: "utils.arv",
        code: `style truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

style visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { truncate, visuallyHidden } from "./utils.arv";

<p className={truncate}>A very long line that should ellipsize…</p>
<span className={visuallyHidden}>Screen-reader only label</span>

// truncate === "truncate_0tgf3h" — just a string`,
      },
      {
        type: "p",
        text: fbt(
          "Style names become JavaScript exports, so they must be valid identifiers (camelCase by convention — ARV116 rejects my-util) and unique within the file, including against component names (ARV117).",
          "Docs content — styles: naming rules",
        ),
      },
      {
        type: "h2",
        text: fbt("What styles can contain", "Docs content — heading: styles contents"),
      },
      {
        type: "p",
        text: fbt(
          "Styles support the full fragment feature set — declarations, token references, use, and `&-states` — everything except props and structure:",
          "Docs content — styles: contents lead-in",
        ),
      },
      {
        type: "code",
        code: `style panel {
  use Surface;
  padding: space.4;

  &:hover {
    border-color: color.primary;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Variants and slots are deliberately rejected — the compiler error tells you to graduate to a component. That is the design line: a style is one class; the moment it needs a second flavor or a second element, it is a component with one variant or two slots.",
          "Docs content — styles: graduation",
        ),
      },
      {
        type: "h2",
        text: fbt("Composing with components", "Docs content — heading: styles composing"),
      },
      {
        type: "p",
        text: fbt(
          "Class strings concatenate, so styles layer cleanly on top of component slots:",
          "Docs content — styles: compose lead-in",
        ),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { Card } from "./card.arv";
import { truncate } from "./utils.arv";

const card = Card();

<div className={card.root}>
  <h3 className={\`\${card.title} \${truncate}\`}>Long title that ellipsizes</h3>
</div>`,
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "Styles are emitted after components in the generated CSS — utilities last. With equal specificity, the utility wins the cascade, which is exactly what you want when truncate overrides a component's white-space.",
          "Docs note — styles: utilities last",
        ),
      },
      { type: "h2", text: fbt("HMR guarantee", "Docs content — heading: styles hmr") },
      {
        type: "p",
        text: fbt(
          "Like components, a style's class name is hashed from the file path and name — not its declarations. Editing the declarations changes only the CSS output; the JS and type declarations stay byte-identical, so the dev server hot-swaps the stylesheet without re-running any of your modules.",
          "Docs content — styles: hmr",
        ),
      },
    ],
  };
}

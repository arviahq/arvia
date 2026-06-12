import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function global(): DocSection {
  return {
    title: fbt("Global styles", "Docs page title — Global styles"),
    slug: "global",
    description: fbt(
      "Resets, typography, and document-level rules with token support.",
      "Docs page description — Resets, typography, and document-level rules.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Most of your styles belong to components, but every app has rules that target the document itself: box-sizing resets, body typography, scrollbar tweaks, overrides for third-party widgets. The global block holds exactly those:",
          "Docs content — global: opening",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `global {
  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    min-height: 100%;
  }

  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
    background: color.background;
    color: color.text;
  }

  a {
    color: inherit;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Each rule is a selector followed by declarations. Selectors are passed through to the CSS untouched — element names, classes, attribute selectors, pseudo-classes, comma-separated lists, anything the browser accepts. Values get the full token treatment: color.background above compiles to the token's value (or its CSS variable in moded themes).",
          "Docs content — global: rule semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("Where global blocks live", "Docs content — heading: where globals live"),
      },
      {
        type: "p",
        text: fbt(
          "Global rules ship with the file that declares them, so the usual home is your theme file — import it once in your app entry and the resets arrive together with the token variables. Any .arv file may declare a global block, though: a docs-page file can carry the styles for rendered markdown, scoped to wherever that file is imported.",
          "Docs content — global: where they live",
        ),
      },
      {
        type: "code",
        label: "src/main.tsx",
        code: `import "./theme.arv"; // global rules + token variables, once`,
      },
      { type: "h2", text: fbt("Styling third-party DOM", "Docs content — heading: third-party") },
      {
        type: "p",
        text: fbt(
          "Because selectors are verbatim, global is the escape hatch for markup you do not render yourself — syntax highlighters, embeds, portals:",
          "Docs content — global: third-party lead-in",
        ),
      },
      {
        type: "code",
        code: `global {
  .shiki {
    margin: 0;
    padding: space.4;
    background: transparent !important;
    overflow-x: auto;
  }

  .shiki code {
    display: block;
    min-width: min-content;
  }
}`,
      },
      { type: "h2", text: fbt("The rules of global", "Docs content — heading: rules of global") },
      {
        type: "ul",
        items: [
          fbt(
            "Flat rules only: selector { declarations }. There is no nesting and no &-states — write a second rule (a:hover { … }) instead.",
            "Docs list item — global: flat only",
          ),
          fbt(
            "No at-rules: @media and @supports cannot wrap global rules. Viewport-dependent styling belongs in components via responsive blocks; the mode media query is generated for you by theme modes.",
            "Docs list item — global: no at-rules",
          ),
          fbt(
            "Unscoped by design: these rules have no hash and apply to the whole document — keep them few and foundational.",
            "Docs list item — global: unscoped",
          ),
        ],
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "Reaching for global to style your own components — global { .card:hover { … } } — defeats the checker and the hashing. If it is your markup, give it a component or a style; use global only for the document and DOM you do not own.",
          "Docs note — global: anti-pattern",
        ),
      },
      { type: "h2", text: fbt("Global vs style", "Docs content — heading: global vs style") },
      {
        type: "p",
        text: fbt(
          "Both produce plain CSS, so the line is ownership of the selector. A style declaration exports a generated class you attach in markup — scoped, hashed, composable. A global rule styles names that already exist — elements, vendor classes. If you find yourself inventing a class name inside global, you wanted a style.",
          "Docs content — global: vs style",
        ),
      },
    ],
  };
}

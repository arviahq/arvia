import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function introduction(): DocSection {
  return {
    title: fbt("Introduction", "Docs page title — Introduction"),
    slug: "introduction",
    description: fbt(
      "What Arvia is, how it works, and how it compares to other styling approaches.",
      "Docs page description — What Arvia is, how it works, and how it compares.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Arvia is a design system compiler. You describe your design system — tokens, themes, reusable style fragments, and multi-variant components — in .arv files, and the compiler turns them into three artifacts: plain CSS, a tiny typed JavaScript API, and TypeScript declarations. Nothing styling-related runs in the browser at runtime; every class name and every rule exists before your app boots.",
          "Docs content — intro: what Arvia is",
        ),
      },
      {
        type: "p",
        text: fbt(
          "That single idea — styles are compiled, not computed — drives everything else in the language. Because the compiler sees your whole design system at build time, it can give you typo-proof token references, typed component props, dead-variant warnings, and editor autocomplete, while shipping CSS that is indistinguishable from hand-written stylesheets.",
          "Docs content — intro: compiled not computed",
        ),
      },
      { type: "h2", text: fbt("A taste of the language", "Docs content — heading: a taste") },
      {
        type: "p",
        text: fbt(
          "Here is a complete, working Arvia file. It defines two design tokens, a reusable focus-ring recipe, and a button component with two variant dimensions:",
          "Docs content — intro: taste example lead-in",
        ),
      },
      {
        type: "code",
        label: "button.arv",
        code: `theme {
  color {
    primary = #635bff;
    danger = #e5484d;
  }
}

recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.primary;
    outline-offset: 2px;
  }
}

component Button {
  base {
    display: inline-flex;
    align-items: center;
    border-radius: 8px;
    cursor: pointer;
    use FocusRing;
  }

  variants {
    size {
      sm { padding: 4px 12px; }
      lg { padding: 8px 20px; }
    }
    tone {
      primary { background: color.primary; color: white; }
      danger { background: color.danger; color: white; }
    }
  }

  defaults { size: sm; tone: primary; }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Importing this file gives you a plain function. Calling it returns class names — one per element the component styles — with full TypeScript checking on every prop:",
          "Docs content — intro: usage lead-in",
        ),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { Button } from "./button.arv";

const styles = Button({ size: "lg", tone: "danger" });
// styles.root === "Button_root_0p4oom Button_size_lg_root_0p4oom Button_tone_danger_root_0p4oom"

<button className={styles.root}>Delete</button>

Button({ size: "xl" });
//        ~~~~ TypeScript error: '"xl"' is not assignable to '"sm" | "lg"'`,
      },
      {
        type: "p",
        text: fbt(
          "There is no <Button> React component here, and that is deliberate. Arvia generates styling APIs, not UI components — you keep full control of your markup, accessibility attributes, and event handling. The generated function is pure string concatenation: no style injection, no context providers, no runtime theme objects.",
          "Docs content — intro: styling API not components",
        ),
      },
      { type: "h2", text: fbt("The six building blocks", "Docs content — heading: six blocks") },
      {
        type: "p",
        text: fbt(
          "Everything you can write at the top level of an .arv file is one of six constructs. Each has its own page in these docs, but the one-line summary is:",
          "Docs content — intro: six constructs lead-in",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Construct", "Docs table header — construct"),
          fbt("What it does", "Docs table header — what it does"),
        ],
        rows: [
          [
            "theme { … }",
            fbt(
              "Declares global design tokens (colors, spacing, …) and optional light/dark modes.",
              "Docs table cell — theme summary",
            ),
          ],
          [
            "global { … }",
            fbt(
              "Emits document-level CSS rules: resets, body typography, third-party overrides.",
              "Docs table cell — global summary",
            ),
          ],
          [
            "recipe Name { … }",
            fbt(
              "A reusable style fragment that other declarations pull in with 'use'. Generates no output by itself.",
              "Docs table cell — recipe summary",
            ),
          ],
          [
            "style name { … }",
            fbt(
              "A single CSS class exported as a string constant — utilities without component ceremony.",
              "Docs table cell — style summary",
            ),
          ],
          [
            "component Name { … }",
            fbt(
              "A typed, multi-variant, multi-slot style generator — the heart of the language.",
              "Docs table cell — component summary",
            ),
          ],
          [
            "keyframes name { … }",
            fbt(
              "A named CSS animation, referenced from components as keyframes.name.",
              "Docs table cell — keyframes summary",
            ),
          ],
        ],
      },
      { type: "h2", text: fbt("How it compares", "Docs content — heading: how it compares") },
      {
        type: "p",
        text: fbt(
          "Arvia sits in the build-time styling camp, but it differs from its neighbors in what it makes first-class. The honest comparison:",
          "Docs content — intro: comparison lead-in",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Approach", "Docs table header — approach"),
          fbt("Runtime cost", "Docs table header — runtime cost"),
          fbt("Where Arvia differs", "Docs table header — where Arvia differs"),
        ],
        rows: [
          [
            fbt("CSS-in-JS (styled-components, Emotion)", "Docs table cell — css-in-js"),
            fbt("Styles computed and injected in the browser", "Docs table cell — css-in-js cost"),
            fbt(
              "Arvia resolves everything at build time; the browser only ever sees static CSS and class-name strings.",
              "Docs table cell — css-in-js diff",
            ),
          ],
          [
            fbt("CSS Modules", "Docs table cell — css modules"),
            fbt("None", "Docs table cell — css modules cost"),
            fbt(
              "CSS Modules scope class names but know nothing about your design system. Arvia adds typed variants, slots, compound rules, and tokens with checked references.",
              "Docs table cell — css modules diff",
            ),
          ],
          [
            fbt("Tailwind CSS", "Docs table cell — tailwind"),
            fbt("None", "Docs table cell — tailwind cost"),
            fbt(
              "Tailwind composes utilities in markup; component variants live in className logic. Arvia moves that logic into a compiled, typed definition next to your styles.",
              "Docs table cell — tailwind diff",
            ),
          ],
          [
            fbt("vanilla-extract", "Docs table cell — vanilla-extract"),
            fbt("None", "Docs table cell — vanilla-extract cost"),
            fbt(
              "Closest in spirit. vanilla-extract is TypeScript-first; Arvia is a dedicated language with CSS-native syntax, its own checker with did-you-mean fixes, and a language server.",
              "Docs table cell — vanilla-extract diff",
            ),
          ],
        ],
      },
      { type: "h2", text: fbt("Framework-agnostic by design", "Docs content — heading: agnostic") },
      {
        type: "p",
        text: fbt(
          "The generated JavaScript has zero dependencies — it is a handful of object lookups and string concatenations. Official Vite plugins exist for React, Preact, and Vue, but anything that can render a class attribute can consume an Arvia component: Svelte, Solid, Lit, or a server-rendered template.",
          "Docs content — intro: framework agnostic",
        ),
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "The fastest way to get a feel for the language is the interactive playground — every example in these docs can be pasted there to inspect the CSS, JS, and type declarations it compiles to.",
          "Docs note — try the playground",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Ready to set it up? Head to Installation, or skim Thinking in Arvia first if you want the mental model before the mechanics.",
          "Docs content — intro: next steps",
        ),
      },
    ],
  };
}

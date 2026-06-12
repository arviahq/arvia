import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function quickStart(): DocSection {
  return {
    title: fbt("Quick start", "Docs page title — Quick start"),
    slug: "quick-start",
    description: fbt(
      "Build a themed, variant-driven button in five small steps.",
      "Docs page description — Build a themed button in five steps.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "This tutorial walks through a complete, realistic setup: design tokens with a dark mode, a button with variants and a hover state, and a responsive override — with a look at what the compiler generates at each step. It assumes you finished Installation.",
          "Docs content — quickstart: overview",
        ),
      },
      { type: "h2", text: fbt("1. Define your tokens", "Docs content — 1. Define your tokens") },
      {
        type: "p",
        text: fbt(
          "Everything starts with a theme file. Tokens are named values organized into groups; modes declare that some of them change between light and dark:",
          "Docs content — quickstart: tokens lead-in",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `theme {
  modes: light | dark;

  color {
    primary = #635bff;
    text = #111111;
    background = #ffffff;

    @dark {
      text = #eeeeee;
      background = #111113;
    }
  }

  space {
    1 = 4px;
    2 = 8px;
    3 = 12px;
    4 = 16px;
  }

  radius { md = 8px; }
  font { sm = 13px; md = 15px; }
  breakpoint { md = 768px; }
}

global {
  body {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: color.background;
    color: color.text;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Because the theme declares modes, the moded color tokens compile to CSS custom properties that flip automatically with the OS color scheme. The space and radius tokens have one value, so they are inlined wherever they are used.",
          "Docs content — quickstart: tokens explanation",
        ),
      },
      { type: "h2", text: fbt("2. Import the theme once", "Docs content — 2. Import theme once") },
      {
        type: "code",
        label: "src/main.tsx",
        code: `import "./theme.arv";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(<App />);`,
      },
      {
        type: "p",
        text: fbt(
          "Importing the theme ships its global rules and CSS variables. Component files do not import the theme — the Vite plugin makes its tokens visible to every `.arv` file in the project automatically.",
          "Docs content — quickstart: import theme explanation",
        ),
      },
      { type: "h2", text: fbt("3. Create a component", "Docs content — 3. Create a component") },
      {
        type: "code",
        label: "src/button.arv",
        code: `component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    border: none;
    border-radius: radius.md;
    color: white;
    cursor: pointer;
    background: color.primary;

    &:hover {
      filter: brightness(1.08);
    }
  }

  variants {
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      lg { padding: space.2 space.4; font-size: font.md; }
    }
  }

  defaults { size: sm; }

  responsive {
    md { size: lg; }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Read it top to bottom: base styles apply always, each size value adds its own padding and font-size, sm is the default when callers pass nothing, and the `responsive` block bumps the default to lg once the viewport crosses the md breakpoint from the theme.",
          "Docs content — quickstart: component explanation",
        ),
      },
      { type: "h2", text: fbt("4. Use it in your app", "Docs content — 4. Use in your app") },
      {
        type: "code",
        label: "src/App.tsx",
        code: `import { Button } from "./button.arv";

export function App() {
  const styles = Button();          // size: "sm", grows to lg at 768px
  const big = Button({ size: "lg" }); // always lg

  return (
    <main>
      <button className={styles.root}>Get started</button>
      <button className={big.root}>Always big</button>
    </main>
  );
}`,
      },
      {
        type: "p",
        text: fbt(
          'Hover over Button in your editor: the props are fully typed from the .arv source, including the responsive object form { initial: "sm", md: "lg" } for per-breakpoint control from the call site.',
          "Docs content — quickstart: usage explanation",
        ),
      },
      { type: "h2", text: fbt("5. See what you shipped", "Docs content — 5. What you shipped") },
      {
        type: "p",
        text: fbt(
          "The compiler emitted static CSS with stable, hashed class names, and a small JS module. The interesting part of each:",
          "Docs content — quickstart: output lead-in",
        ),
      },
      {
        type: "code",
        label: "generated CSS (excerpt)",
        lang: "css",
        code: `.Button_root_0tbkbv {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  /* … */
}

.Button_size_sm_root_0tbkbv { padding: 4px 12px; font-size: 13px; }
.Button_size_lg_root_0tbkbv { padding: 8px 16px; font-size: 15px; }

@media (min-width: 768px) {
.Button_size_lg_bp_md_root_0tbkbv { padding: 8px 16px; font-size: 15px; }
}`,
      },
      {
        type: "code",
        label: "generated JS (conceptually)",
        lang: "js",
        code: `export function Button(props) {
  // pure lookups — returns { root: "Button_root_0tbkbv Button_size_sm_root_0tbkbv …" }
}`,
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "Toggle your OS color scheme while the dev server runs: the page flips to dark with no JavaScript involved, because the moded tokens are plain CSS custom properties.",
          "Docs note — quickstart dark mode tip",
        ),
      },
      { type: "h2", text: fbt("Where to next", "Docs content — heading: where to next") },
      {
        type: "ul",
        items: [
          fbt(
            "[Thinking in Arvia](/docs/thinking-in-arvia) — the mental model behind the language and when to reach for each construct.",
            "Docs list item — next: thinking",
          ),
          fbt(
            "[Theme & tokens](/docs/theme) — everything tokens can do: aliases, doc strings, digit-led scales.",
            "Docs list item — next: theme",
          ),
          fbt(
            "[Components](/docs/components) — slots, states, compound variants, and the full component anatomy.",
            "Docs list item — next: components",
          ),
        ],
      },
    ],
  };
}

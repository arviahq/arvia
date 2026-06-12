import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function themeModes(): DocSection {
  return {
    title: fbt("Theme modes", "Docs page title — Theme modes"),
    slug: "theme-modes",
    description: fbt(
      "Light, dark, and beyond: mode-aware tokens with zero JavaScript.",
      "Docs page description — Light/dark theming with modes.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "A modes declaration turns selected tokens into mode-aware CSS custom properties. Declare the modes once, then override any token per mode with an @mode block:",
          "Docs content — modes: opening",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `theme {
  modes: light | dark;

  color {
    text = #111111;
    background = #ffffff;
    primary = #635bff;

    @dark {
      text = #eeeeee;
      background = #111113;
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "The first mode in the list is the default — its values are the token declarations themselves. Tokens without an override (primary above) keep one value across all modes. Mode overrides live inside the group they affect, next to the values they replace.",
          "Docs content — modes: basic semantics",
        ),
      },
      { type: "h2", text: fbt("The generated CSS", "Docs content — heading: modes generated css") },
      {
        type: "p",
        text: fbt(
          "Modes compile to four kinds of rules — defaults on :root, an OS-preference media query, and one attribute selector per mode for manual control:",
          "Docs content — modes: generated lead-in",
        ),
      },
      {
        type: "code",
        label: "generated CSS",
        lang: "css",
        code: `:root {
  --arvia-color-text: #111111;
  --arvia-color-background: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --arvia-color-text: #eeeeee;
    --arvia-color-background: #111113;
  }
}

[data-arvia-theme="light"] {
  --arvia-color-text: #111111;
  --arvia-color-background: #ffffff;
}

[data-arvia-theme="dark"] {
  --arvia-color-text: #eeeeee;
  --arvia-color-background: #111113;
}`,
      },
      {
        type: "p",
        text: fbt(
          "Read the cascade: with no attribute set, the OS preference wins via the media query. Setting data-arvia-theme on the root element overrides it, because attribute selectors come later. Every style that references a moded token compiles to var(--arvia-color-…), so the whole page reacts instantly to either signal — no re-render, no JavaScript theme context.",
          "Docs content — modes: cascade explanation",
        ),
      },
      { type: "h2", text: fbt("A theme switcher", "Docs content — heading: theme switcher") },
      {
        type: "p",
        text: fbt(
          "Manual switching is one attribute write. A complete three-state switcher (system / light / dark) with persistence:",
          "Docs content — modes: switcher lead-in",
        ),
      },
      {
        type: "code",
        label: "theme-switcher.tsx",
        code: `type Mode = "system" | "light" | "dark";

function applyMode(mode: Mode) {
  if (mode === "system") {
    delete document.documentElement.dataset.arviaTheme;
  } else {
    document.documentElement.dataset.arviaTheme = mode;
  }
  localStorage.setItem("theme", mode);
}

// On boot, before React renders (avoids a flash):
applyMode((localStorage.getItem("theme") as Mode) ?? "system");`,
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "Removing the attribute returns control to prefers-color-scheme — that is your “system” setting for free. Run the boot line in a small inline script in index.html if you need to beat the first paint.",
          "Docs note — modes: system setting tip",
        ),
      },
      { type: "h2", text: fbt("More than two modes", "Docs content — heading: more modes") },
      {
        type: "p",
        text: fbt(
          "Modes are not limited to light and dark — declare as many as you need (high-contrast, dim, brand themes). Each gets its own @mode override blocks and attribute selector:",
          "Docs content — modes: many modes lead-in",
        ),
      },
      {
        type: "code",
        code: `theme {
  modes: light | dark | dim;

  color {
    text = #111111;
    @dark { text = #eeeeee; }
    @dim  { text = #999999; }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Only a mode literally named dark participates in the prefers-color-scheme media query; other non-default modes are reachable through data-arvia-theme alone. The first mode remains the :root default either way.",
          "Docs content — modes: dark is special",
        ),
      },
      {
        type: "h2",
        text: fbt("Which tokens become variables", "Docs content — heading: which tokens vars"),
      },
      {
        type: "p",
        text: fbt(
          "Once modes are declared, every theme token compiles to a CSS custom property and every reference to one becomes var(…) — including tokens that never vary, which keeps the output uniform and lets you add a mode override later without touching consumers. Two things stay inlined: component-local tokens (see Local tokens) and values in single-mode projects.",
          "Docs content — modes: which become vars",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Situation", "Docs table header — situation"),
          fbt("Result", "Docs table header — result"),
        ],
        rows: [
          [
            fbt("@dark override without a modes declaration", "Docs table cell — modes err1"),
            fbt("Error ARV134 — declare modes: first.", "Docs table cell — modes err1 result"),
          ],
          [
            fbt("@blue override when modes are light | dark", "Docs table cell — modes err2"),
            fbt("Error ARV132 — unknown theme mode.", "Docs table cell — modes err2 result"),
          ],
          [
            fbt("Mode override inside a component tokens block", "Docs table cell — modes err3"),
            fbt(
              "Rejected — moded values belong in the theme.",
              "Docs table cell — modes err3 result",
            ),
          ],
        ],
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          'The tokens export follows along: with modes enabled, tokens.color.text is the string "var(--arvia-color-text)", so values you pass to inline styles or charts flip with the mode automatically.',
          "Docs note — modes: tokens export follows",
        ),
      },
    ],
  };
}

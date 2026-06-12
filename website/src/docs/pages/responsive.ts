import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function responsive(): DocSection {
  return {
    title: fbt("Responsive", "Docs page title — Responsive"),
    slug: "responsive",
    description: fbt(
      "Breakpoint-driven variant switching — declared in the component or at the call site.",
      "Docs page description — Breakpoint-driven variant overrides.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Responsive behavior in Arvia is variant switching: instead of writing media queries by hand, you say which variant value applies from which breakpoint up. Breakpoints are tokens, declared once in the theme:",
          "Docs content — responsive: opening",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `theme {
  breakpoint {
    md = 768px;
    lg = 1024px;
  }
}`,
      },
      {
        type: "code",
        label: "button.arv",
        code: `component Button {
  variants {
    size {
      sm { padding: space.1 space.3; }
      lg { padding: space.3 space.5; }
    }
  }

  defaults { size: sm; }

  responsive {
    md { size: lg; }    // from 768px up, default to lg
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Read the `responsive` block as overrides to defaults: below 768px a prop-less Button is sm; at 768px and above it becomes lg. Everything is mobile-first min-width — declare the small state as the default and step upward.",
          "Docs content — responsive: author-time semantics",
        ),
      },
      {
        type: "code",
        label: "generated CSS",
        lang: "css",
        code: `.Button_size_sm_root_0tbkbv { padding: 4px 12px; }
.Button_size_lg_root_0tbkbv { padding: 16px 20px; }

@media (min-width: 768px) {
.Button_size_lg_bp_md_root_0tbkbv { padding: 16px 20px; }
}`,
      },
      {
        type: "p",
        text: fbt(
          "The breakpoint variant gets its own media-wrapped class (note the bp_md segment). The component function attaches it alongside the initial value's class; the media query decides which one is visible. No JavaScript runs on resize — the browser does all the switching.",
          "Docs content — responsive: generated css explanation",
        ),
      },
      { type: "h2", text: fbt("Call-site control", "Docs content — heading: call-site control") },
      {
        type: "p",
        text: fbt(
          "Callers get the same power through object props. Any variant covered by a `responsive` block accepts either a plain value or an object with an initial value and per-breakpoint overrides:",
          "Docs content — responsive: object props lead-in",
        ),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `Button({ size: "sm" });                          // fixed — never switches
Button({ size: { initial: "sm", md: "lg" } });   // switches at 768px
Button();                                        // defaults + responsive block`,
      },
      {
        type: "code",
        label: "generated .d.ts",
        code: `export type ButtonProps = {
  size?: "sm" | "lg" | { initial?: "sm" | "lg"; md?: "sm" | "lg"; };
};`,
      },
      {
        type: "p",
        text: fbt(
          "The interplay between the two layers is worth stating precisely — passing a prop takes full control of that variant:",
          "Docs content — responsive: interplay lead-in",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Call", "Docs table header — call"),
          fbt("Below md", "Docs table header — below md"),
          fbt("At md and up", "Docs table header — at md and up"),
        ],
        rows: [
          [
            "Button()",
            fbt("sm (default)", "Docs table cell — responsive r1 below"),
            fbt("lg (`responsive` block)", "Docs table cell — responsive r1 above"),
          ],
          [
            'Button({ size: "sm" })',
            "sm",
            fbt(
              "sm — an explicit prop switches the `responsive` block off for that variant",
              "Docs table cell — responsive r2 above",
            ),
          ],
          ['Button({ size: { initial: "sm", md: "lg" } })', "sm", "lg"],
        ],
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "The object form's breakpoint keys come from the component's `responsive` block — they are what generated the media-wrapped classes. A breakpoint/value pair the component never declared has no CSS behind it, so declare in the `responsive` block whatever you want callers to use.",
          "Docs note — responsive: keys from block",
        ),
      },
      {
        type: "h2",
        text: fbt("Several axes, several breakpoints", "Docs content — heading: several axes"),
      },
      {
        type: "code",
        code: `component Nav {
  variants {
    layout { rail { width: 64px; } full { width: 240px; } }
    labels { hidden { label { display: none; } } shown {} }
  }

  slots { root {} label {} }
  defaults { layout: rail; labels: hidden; }

  responsive {
    md { layout: full; }
    lg { labels: shown; }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Each entry maps one breakpoint to one or more variant overrides; different axes can switch at different widths. An unknown breakpoint name is an error pointing you to the theme (ARV141).",
          "Docs content — responsive: multi axes semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("Viewport or container?", "Docs content — heading: viewport or container"),
      },
      {
        type: "p",
        text: fbt(
          "Responsive blocks answer “how wide is the screen?” — the right question for page-level layout: navigation, grids, gutters. For a component that must adapt to wherever it is dropped — a card in a sidebar versus the same card in the main column — ask “how wide am I?” instead, with a `container` block. The two compose freely in one component; see [Container queries](/docs/container-queries).",
          "Docs content — responsive: vs container",
        ),
      },
    ],
  };
}

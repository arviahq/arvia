import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function containerQueries(): DocSection {
  return {
    title: fbt("Container queries", "Docs page title — Container queries"),
    slug: "container-queries",
    description: fbt(
      "Components that adapt to their own width, not the viewport's.",
      "Docs page description — Layout responding to container width.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "A breakpoint answers the wrong question for reusable components: a card needs to know how wide it is, not how wide the screen is — the same card may render in a 300px sidebar and a 900px main column on one page. Container blocks switch variants based on the component's own rendered width:",
          "Docs content — container: opening",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `theme {
  container {
    wide = 480px;
  }
}`,
      },
      {
        type: "code",
        label: "card.arv",
        code: `component Card {
  slots { root {} media {} body {} }

  base {
    display: flex;
    flex-direction: column;
    gap: space.3;
  }

  variants {
    layout {
      stacked {}
      row {
        flex-direction: row;
        media { width: 40%; }
      }
    }
  }

  defaults { layout: stacked; }

  container {
    wide { layout: row; }   // ≥ 480px of available width → row
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Container sizes live in the theme's container group, exactly parallel to breakpoints. The block reads: when this component's container is at least 480px wide, the layout variant becomes row — wherever that happens to occur on screen.",
          "Docs content — container: basic semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("What the compiler sets up", "Docs content — heading: container setup"),
      },
      {
        type: "p",
        text: fbt(
          "Container queries need an element declared as a measurement container. Arvia handles that: a component with a container block gets container-type: inline-size on its root automatically, and the override styles are wrapped in @container:",
          "Docs content — container: setup lead-in",
        ),
      },
      {
        type: "code",
        label: "generated CSS",
        lang: "css",
        code: `.Card_root_0cgz70 {
  container-type: inline-size;
}

.Card_layout_row_root_0cgz70 {
  flex-direction: row;
}

@container (min-width: 480px) {
.Card_layout_row_cq_wide_root_0cgz70 {
  flex-direction: row;
}
}`,
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "The measured container is the nearest ancestor with a container-type — for this component's children, its own root. Sizing the root itself with a container query is impossible by CSS's rules (a container cannot query itself), which is why container overrides are most useful on inner slots and layout properties.",
          "Docs note — container: nearest ancestor",
        ),
      },
      {
        type: "h2",
        text: fbt("Call-site control with $ keys", "Docs content — heading: dollar keys"),
      },
      {
        type: "p",
        text: fbt(
          "Like responsive blocks, container behavior is also available per call site. Container keys are prefixed with $ to keep the two query kinds distinct in one object:",
          "Docs content — container: dollar lead-in",
        ),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `Card({ layout: { initial: "stacked", $wide: "row" } });`,
      },
      {
        type: "code",
        label: "generated .d.ts",
        code: `export type CardProps = {
  layout?: "stacked" | "row" | { initial?: "stacked" | "row"; "$wide"?: "stacked" | "row"; };
};`,
      },
      {
        type: "p",
        text: fbt(
          "The semantics mirror responsive props exactly: passing a plain value pins the variant and disables the component's container block for it; the object form sets the initial value and per-container-size overrides; and the available $ keys are the ones the component's container block declared.",
          "Docs content — container: prop semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("Mixing viewport and container", "Docs content — heading: mixing queries"),
      },
      {
        type: "p",
        text: fbt(
          "A component can carry both blocks, and one variant can be driven by both. The object prop form then accepts both key kinds — bare names are breakpoints, $-names are container sizes:",
          "Docs content — container: mixing lead-in",
        ),
      },
      {
        type: "code",
        code: `theme {
  breakpoint { md = 768px; }
  container { wide = 480px; }
}

component Toolbar {
  variants {
    density { compact { gap: space.1; } cozy { gap: space.3; } }
  }
  defaults { density: compact; }

  responsive { md { density: cozy; } }     // page got roomier
  container { wide { density: cozy; } }    // or just this toolbar did
}

// Toolbar({ density: { initial: "compact", md: "cozy", $wide: "cozy" } })`,
      },
      {
        type: "p",
        text: fbt(
          "Both query kinds emit additive classes with the same specificity, so when several apply the later stylesheet rule wins. In practice the rule of thumb stays simple: viewport for page chrome, container for everything you expect to drop into unknown layouts.",
          "Docs content — container: mixing semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("A worked example", "Docs content — heading: container worked example"),
      },
      {
        type: "p",
        text: fbt(
          "The payoff is components that are correct by construction wherever they land. This stat panel switches to a horizontal layout only when its spot actually affords it:",
          "Docs content — container: worked lead-in",
        ),
      },
      {
        type: "code",
        label: "stat-panel.arv",
        code: `component StatPanel {
  slots { root {} value {} label {} delta {} }

  base {
    use Surface;
    display: flex;
    flex-direction: column;
    gap: space.1;
    padding: space.4;

    value { font-size: font.xl; font-weight: 700; }
    label { color: color.muted; font-size: font.sm; }
  }

  variants {
    arrangement {
      stacked {}
      inline {
        flex-direction: row;
        align-items: baseline;
        gap: space.3;
        value { font-size: font.lg; }
      }
    }
  }

  defaults { arrangement: stacked; }

  container {
    wide { arrangement: inline; }
  }
}`,
      },
      {
        type: "code",
        label: "Dashboard.tsx",
        code: `// Same component, no props, both placements correct:
<aside className={sidebar}>
  <StatPanelView />   {/* 280px slot → stacked */}
</aside>
<main className={main}>
  <StatPanelView />   {/* 720px slot → inline, automatically */}
</main>`,
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "Name container sizes by meaning (wide, full, split) rather than by pixel value — the threshold lives in the theme and can be tuned once for every component that uses it.",
          "Docs note — container: naming sizes",
        ),
      },
    ],
  };
}

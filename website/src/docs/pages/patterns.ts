import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function patterns(): DocSection {
  return {
    title: fbt("Advanced patterns", "Docs page title — Advanced patterns"),
    slug: "patterns",
    description: fbt(
      "Recipes for real systems: layered recipes, data-state styling, adaptive layouts.",
      "Docs page description — Advanced composition patterns.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Every pattern here uses only features from the language pages — what changes is how far they are pushed and how they combine. All examples are complete and compile as written (given the tokens they reference).",
          "Docs content — patterns: opening",
        ),
      },
      {
        type: "h2",
        text: fbt("A layered recipe library", "Docs content — heading: pattern recipe library"),
      },
      {
        type: "p",
        text: fbt(
          "Treat theme recipes as your system's axioms — small, orthogonal, and combinable. Higher layers add meaning, components add looks:",
          "Docs content — patterns: recipe library lead-in",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `recipe FocusRing {
  outline: none;
  &:focus-visible {
    outline: 2px solid color.accent;
    outline-offset: 2px;
  }
}

recipe PressEffect {
  &:active { transform: translateY(1px); }
}

recipe Interactive {
  use FocusRing;
  use PressEffect;
  cursor: pointer;
  user-select: none;
  &:disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }
}

recipe Surface {
  background: color.surface;
  border: 1px solid color.border;
  border-radius: radius.lg;
}`,
      },
      {
        type: "code",
        label: "anywhere",
        code: `component IconButton {
  use Interactive;
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: radius.md;
}`,
      },
      {
        type: "p",
        text: fbt(
          "When the design team changes what “focusable” means, one recipe edit updates every interactive element — and because recipes flatten at compile time, the runtime cost of the abstraction is zero.",
          "Docs content — patterns: recipe library payoff",
        ),
      },
      { type: "h2", text: fbt("Group hover menus", "Docs content — heading: pattern group hover") },
      {
        type: "p",
        text: fbt(
          "Cross-slot states handle reveal-on-hover UI without a line of JavaScript. The actions slot fades in when the row is hovered or anything inside it has focus:",
          "Docs content — patterns: group hover lead-in",
        ),
      },
      {
        type: "code",
        label: "list-row.arv",
        code: `component ListRow {
  slots { root {} title {} actions {} }

  base {
    display: flex;
    align-items: center;
    gap: space.3;
    padding: space.2 space.3;
    border-radius: radius.md;

    title { flex: 1; min-width: 0; }
    actions { opacity: 0; transition: opacity duration.fast; }

    &:hover {
      background: color.surfaceRaised;
      actions { opacity: 1; }
    }

    &:focus-within {
      actions { opacity: 1; }
    }
  }
}`,
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "The &:focus-within block keeps the pattern accessible: keyboard users tabbing to a hidden action button reveal the actions too. Pair reveal-on-hover with focus-within every time.",
          "Docs note — patterns: focus-within",
        ),
      },
      {
        type: "h2",
        text: fbt("Data-attribute state machines", "Docs content — heading: pattern data state"),
      },
      {
        type: "p",
        text: fbt(
          "For state that changes every frame or comes from a headless UI library, skip variants and bind styles to data attributes — the JS writes one attribute, the CSS does the rest:",
          "Docs content — patterns: data state lead-in",
        ),
      },
      {
        type: "code",
        label: "disclosure.arv",
        code: `component Disclosure {
  slots { root {} trigger {} chevron {} panel {} }

  base {
    trigger {
      use Interactive;
      display: flex;
      align-items: center;
      gap: space.2;
      width: 100%;
    }

    chevron { transition: transform duration.fast easing.out; }
    panel { display: none; padding: space.3; }

    &[data-state="open"] {
      chevron { transform: rotate(90deg); }
      panel { display: block; }
    }
  }
}`,
      },
      {
        type: "code",
        label: "Disclosure.tsx",
        code: `const s = Disclosure();

<div className={s.root} data-state={open ? "open" : "closed"}>
  <button className={s.trigger} aria-expanded={open} onClick={toggle}>
    <span className={s.chevron}>▸</span> {label}
  </button>
  <div className={s.panel}>{children}</div>
</div>`,
      },
      {
        type: "p",
        text: fbt(
          "The dividing line from variants: variants are for values decided at render time and worth type-checking; data attributes are for live state the DOM already tracks. Radix-style libraries set data-state for you — this pattern styles them directly.",
          "Docs content — patterns: data state vs variants",
        ),
      },
      {
        type: "h2",
        text: fbt("The fully adaptive card", "Docs content — heading: pattern adaptive card"),
      },
      {
        type: "p",
        text: fbt(
          "Everything at once — slots, variants, compound, container queries, and a recipe — in a component that stays correct in any column the layout offers:",
          "Docs content — patterns: adaptive card lead-in",
        ),
      },
      {
        type: "code",
        label: "feature-card.arv",
        code: `component FeatureCard {
  slots { root {} media {} body {} title {} meta {} }

  base {
    use Surface;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    media { aspect-ratio: 16 / 9; background: color.surfaceRaised; }
    body { display: flex; flex-direction: column; gap: space.2; padding: space.4; }
    title { font-size: font.lg; font-weight: 600; }
    meta { color: color.muted; font-size: font.sm; }
  }

  variants {
    emphasis {
      normal {}
      featured {
        border-color: color.accent;
        title { color: color.accent; }
      }
    }
    layout {
      stacked {}
      split {
        flex-direction: row;
        media { aspect-ratio: auto; width: 240px; }
      }
    }
  }

  defaults { emphasis: normal; layout: stacked; }

  container {
    wide { layout: split; }      // go horizontal when ≥ wide
  }

  compound {
    emphasis: featured;
    layout: split;
    media { width: 320px; }      // featured + split earns bigger art
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Trace a card rendered in a 700px column: the container block flips layout to split, and if it is also featured, the compound matches and widens the media slot. Drag the same card into a 300px sidebar and all of it unwinds — no props, no resize observers.",
          "Docs content — patterns: adaptive card trace",
        ),
      },
      {
        type: "h2",
        text: fbt("Page-level composition", "Docs content — heading: pattern page level"),
      },
      {
        type: "p",
        text: fbt(
          "Styles and components cooperate at the page level: components own reusable pieces, styles own the page's one-off scaffolding, and class concatenation glues them:",
          "Docs content — patterns: page level lead-in",
        ),
      },
      {
        type: "code",
        label: "dashboard.arv",
        code: `style dashboardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: space.4;
}

style spanTwo {
  grid-column: span 2;
}`,
      },
      {
        type: "code",
        label: "Dashboard.tsx",
        code: `import { dashboardGrid, spanTwo } from "./dashboard.arv";
import { FeatureCard } from "./feature-card.arv";

const hero = FeatureCard({ emphasis: "featured" });
const card = FeatureCard();

<div className={dashboardGrid}>
  <article className={\`\${hero.root} \${spanTwo}\`}>…</article>
  <article className={card.root}>…</article>
</div>`,
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "The grid auto-fills and the cards adapt per container — the two patterns multiply: one component definition covers every cell shape this page can produce.",
          "Docs note — patterns: multiply",
        ),
      },
    ],
  };
}

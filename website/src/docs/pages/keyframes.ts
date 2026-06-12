import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function keyframes(): DocSection {
  return {
    title: fbt("Keyframes", "Docs page title — Keyframes"),
    slug: "keyframes",
    description: fbt(
      "Named animations with token support and collision-free names.",
      "Docs page description — Named animations referenced from components.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "A `keyframes` block declares a CSS animation. Steps are from, to, or percentages, and values resolve tokens like everywhere else. Components reference an animation as `keyframes.name`:",
          "Docs content — keyframes: opening",
        ),
      },
      {
        type: "code",
        code: `theme {
  duration { fast = 120ms; normal = 200ms; }
  easing { out = cubic-bezier(0.16, 1, 0.3, 1); }
}

keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

component Toast {
  base {
    animation: keyframes.fadeIn duration.normal easing.out;
  }
}`,
      },
      { type: "h2", text: fbt("Hashed names", "Docs content — heading: keyframes hashed") },
      {
        type: "p",
        text: fbt(
          "Animation names share one global namespace in CSS, so the compiler hashes them the same way it hashes class names — fadeIn becomes something like fadeIn_1kqpaa, and the `keyframes.fadeIn` reference resolves to the hashed name:",
          "Docs content — keyframes: hashing lead-in",
        ),
      },
      {
        type: "code",
        label: "generated CSS",
        lang: "css",
        code: `@keyframes fadeIn_1kqpaa {
from {
  opacity: 0;
  transform: translateY(4px);
}

to {
  opacity: 1;
  transform: translateY(0);
}
}

.Toast_root_0tzzc8 {
  animation: fadeIn_1kqpaa 200ms cubic-bezier(0.16, 1, 0.3, 1);
}`,
      },
      {
        type: "p",
        text: fbt(
          "Two files can each declare a fadeIn without colliding, and your animation never fights one from a third-party stylesheet. The flip side: always reference through `keyframes.name` — a hand-written animation: fadeIn would point at a name that does not exist in the output.",
          "Docs content — keyframes: hashing consequences",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "Multi-step and tokens in frames",
          "Docs content — heading: keyframes multi-step",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Percentage steps express richer motion, and token references inside frames keep animation colors and distances on-system:",
          "Docs content — keyframes: multi-step lead-in",
        ),
      },
      {
        type: "code",
        code: `keyframes pulseRing {
  0%   { box-shadow: 0 0 0 0 color.primary; }
  70%  { box-shadow: 0 0 0 space.3 transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}

component Skeleton {
  base {
    background: linear-gradient(90deg, color.border, color.surface, color.border);
    background-size: 200% 100%;
    animation: keyframes.shimmer 1.4s linear infinite;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Like recipes and tokens, keyframes declared in the shared theme file are usable from every component file; keyframes declared elsewhere are local to their file.",
          "Docs content — keyframes: theme availability",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "Animations per variant or state",
          "Docs content — heading: keyframes per variant",
        ),
      },
      {
        type: "code",
        code: `component SaveButton {
  variants {
    status {
      idle {}
      saving {
        animation: keyframes.pulse 1s ease infinite;
      }
    }
  }
  defaults { status: idle; }
}`,
      },
      {
        type: "h2",
        text: fbt("Respecting reduced motion", "Docs content — heading: reduced motion"),
      },
      {
        type: "p",
        text: fbt(
          "Honor `prefers-reduced-motion` at the document level. Arvia's `global` block intentionally has no at-rule support, so this one rule belongs in a small plain CSS file next to your entry point — `!important` lets it cut through every hashed class:",
          "Docs content — keyframes: reduced motion lead-in",
        ),
      },
      {
        type: "code",
        label: "src/motion.css",
        lang: "css",
        code: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`,
      },
      {
        type: "code",
        label: "src/main.tsx",
        code: `import "./theme.arv";
import "./motion.css";`,
      },
    ],
  };
}

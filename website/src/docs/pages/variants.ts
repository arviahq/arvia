import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function variants(): DocSection {
  return {
    title: fbt("Variants & defaults", "Docs page title — Variants & defaults"),
    slug: "variants",
    description: fbt(
      "Prop-driven style axes, defaults, and the types they generate.",
      "Docs page description — Prop-driven style branches with defaults.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Variants are the props of a component. Each variant is an axis with named values; each value carries the styles that apply when a caller picks it:",
          "Docs content — variants: opening",
        ),
      },
      {
        type: "code",
        code: `component Button {
  variants {
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      md { padding: space.2 space.4; font-size: font.md; }
      lg { padding: space.3 space.5; font-size: font.lg; }
    }
    tone {
      primary { background: color.primary; color: white; }
      danger  { background: color.danger; color: white; }
      ghost   { background: transparent; color: color.muted; }
    }
  }

  defaults {
    size: md;
    tone: primary;
  }
}`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `Button();                              // md + primary (defaults)
Button({ size: "lg" });                // lg + primary
Button({ size: "sm", tone: "ghost" }); // sm + ghost`,
      },
      {
        type: "p",
        text: fbt(
          "Axes are orthogonal: every size works with every tone, and the compiler generates one class per value per slot it touches — three sizes and three tones produce six classes, not nine combinations. Styling specific combinations is what compound blocks are for.",
          "Docs content — variants: orthogonal",
        ),
      },
      {
        type: "h2",
        text: fbt("Defaults and required props", "Docs content — heading: defaults required"),
      },
      {
        type: "p",
        text: fbt(
          "The defaults block does double duty: it picks the runtime fallback when a prop is omitted, and it decides the TypeScript signature. A variant with a default is an optional prop; a variant without one is required:",
          "Docs content — variants: defaults semantics",
        ),
      },
      {
        type: "code",
        code: `component Tag {
  variants {
    tone { info {} danger {} }     // no default — callers must choose
    size { sm {} md {} }
  }
  defaults { size: sm; }
}`,
      },
      {
        type: "code",
        label: "generated .d.ts",
        code: `export type TagProps = {
  tone: "info" | "danger";   // required
  size?: "sm" | "md";        // optional
};

export declare function Tag(props: TagProps): TagSlots;`,
      },
      {
        type: "p",
        text: fbt(
          "Leaving a variant default-less is a design statement — “there is no neutral choice here” — and the type system enforces it at every call site. At runtime, an omitted default-less variant simply contributes no class.",
          "Docs content — variants: required statement",
        ),
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "The checker keeps defaults honest: referencing an unknown variant or value in defaults is an error with a fix (ARV124), an empty variant axis is flagged (ARV173), and duplicate axis or value names collide (ARV114).",
          "Docs note — variants: checker support",
        ),
      },
      {
        type: "h2",
        text: fbt("Variant values are full style bodies", "Docs content — heading: full bodies"),
      },
      {
        type: "p",
        text: fbt(
          "A value block is not limited to declarations — it can style slots, attach states, and pull in recipes, all scoped to that value:",
          "Docs content — variants: full bodies lead-in",
        ),
      },
      {
        type: "code",
        code: `component Button {
  slots { root {} icon {} }

  variants {
    tone {
      primary {
        background: color.primary;
        &:hover { filter: brightness(1.06); }   // hover, primary only
      }
      danger {
        use FocusRing;                           // recipe, danger only
        background: color.danger;
        icon { color: white; }                   // slot, danger only
        &:hover { icon { transform: scale(1.1); } } // cross-slot state
      }
    }
  }

  defaults { tone: primary; }
}`,
      },
      { type: "h2", text: fbt("Modeling boolean props", "Docs content — heading: boolean props") },
      {
        type: "p",
        text: fbt(
          "Arvia has no boolean variant type — model on/off as a two-value axis. The names read better than true/false in both the .arv source and the call site, and they leave room for a third state later:",
          "Docs content — variants: boolean modeling",
        ),
      },
      {
        type: "code",
        code: `component Field {
  variants {
    state {
      idle {}
      invalid {
        border-color: color.danger;
        &:focus-visible { outline-color: color.danger; }
      }
    }
  }
  defaults { state: idle; }
}

// Field({ state: invalid ? "invalid" : "idle" })`,
      },
      { type: "h2", text: fbt("How variant classes stack", "Docs content — heading: stacking") },
      {
        type: "p",
        text: fbt(
          "The generated function concatenates, per slot: the base class, then one class per variant axis (the chosen or default value), then any matching compound classes. All have single-class specificity, so source order in the generated stylesheet — base first, variants next, compounds last — gives later layers the win on conflicts:",
          "Docs content — variants: stacking semantics",
        ),
      },
      {
        type: "code",
        label: "what a call returns",
        lang: "js",
        code: `Button({ size: "sm", tone: "danger" }).root
// "Button_root_0p4oom
//  Button_size_sm_root_0p4oom
//  Button_tone_danger_root_0p4oom"`,
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "Responsive and container blocks can re-decide a variant per breakpoint or container width, and callers can pass { initial, md } objects for the same effect — see Responsive and Container queries once your axes are in place.",
          "Docs note — variants: responsive pointer",
        ),
      },
    ],
  };
}

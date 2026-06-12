import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function slots(): DocSection {
  return {
    title: fbt("Slots", "Docs page title — Slots"),
    slug: "slots",
    description: fbt(
      "Named parts of a multi-element component, each with its own class.",
      "Docs page description — Named parts of a multi-element component.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Real components are rarely one element — a button has an icon and a label, a card has a header and a body. Slots give each part a name and its own generated class, while keeping every part's styling inside one component definition:",
          "Docs content — slots: opening",
        ),
      },
      {
        type: "code",
        label: "button.arv",
        code: `component Button {
  slots {
    root {}
    icon { flex-shrink: 0; }
    label { font-weight: 500; }
  }

  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
  }
}`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `const styles = Button();

<button className={styles.root}>
  <span className={styles.icon}>★</span>
  <span className={styles.label}>Save</span>
</button>`,
      },
      {
        type: "p",
        text: fbt(
          "The `slots` block declares the parts; declarations inside a slot are that part's base styles. The function returns one class string per declared slot, and the generated ButtonSlots type knows every name — styles.icno is a compile error in TypeScript, and icno inside the `.arv` file is an ARV120 error with a did-you-mean.",
          "Docs content — slots: declaration semantics",
        ),
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "root is implicit. Every component has it whether or not the `slots` block lists it; loose top-level declarations and bare declarations in base style it. Declaring root {} explicitly is purely stylistic.",
          "Docs note — slots: implicit root",
        ),
      },
      {
        type: "h2",
        text: fbt("Styling slots from anywhere", "Docs content — heading: slots from anywhere"),
      },
      {
        type: "p",
        text: fbt(
          "Slots are addressable from every styling context — base, variant values, `compound` blocks, and states. A nested block named after a slot targets that slot under the surrounding condition:",
          "Docs content — slots: anywhere lead-in",
        ),
      },
      {
        type: "code",
        code: `component Button {
  slots { root {} icon {} label {} }

  base {
    display: inline-flex;
    gap: space.2;
    icon { flex-shrink: 0; }          // always

    &:hover {
      icon { transform: translateX(2px); }  // when root is hovered
    }
  }

  variants {
    size {
      sm {}
      lg {
        font-size: font.lg;
        icon { width: 20px; }          // only at size: lg
      }
    }
    tone {
      default {}
      danger { background: color.danger; }
    }
  }

  compound {
    size: lg;
    tone: danger;
    label { text-transform: uppercase; } // only for that combination
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Each context compiles to its own class on the slot — Button_icon_…, Button_size_lg_icon_… — and the component function merges the right ones into styles.icon for the props you pass. You never assemble per-slot classes by hand.",
          "Docs content — slots: per-context classes",
        ),
      },
      {
        type: "h2",
        text: fbt("Group hover and cross-slot states", "Docs content — heading: group hover"),
      },
      {
        type: "p",
        text: fbt(
          "The hover example above is the cross-slot pattern: a slot block inside an `&-state` styles that slot when the root matches. It compiles to a descendant selector against the slot's base class:",
          "Docs content — slots: cross-slot lead-in",
        ),
      },
      {
        type: "code",
        label: "generated CSS",
        lang: "css",
        code: `.Button_root_0p4oom:hover .Button_icon_0p4oom {
  transform: translateX(2px);
}`,
      },
      {
        type: "p",
        text: fbt(
          "Because the target is the slot's always-present base class, the rule works regardless of which variants are active. The same pattern from a variant body scopes the behavior to that variant — see [States](/docs/states) for the full picture.",
          "Docs content — slots: cross-slot semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("Slots and markup stay decoupled", "Docs content — heading: decoupled"),
      },
      {
        type: "p",
        text: fbt(
          "A slot is a class, not a DOM contract. You decide which element receives it, you can skip rendering a slot entirely (an icon-less button simply never uses styles.icon), and you can hand a slot class to a child component. Unused declared slots are deliberately not a warning for exactly this reason.",
          "Docs content — slots: decoupled",
        ),
      },
      {
        type: "code",
        label: "Card with optional parts",
        code: `component Card {
  slots {
    root {}
    title { font-size: font.lg; font-weight: 600; }
    body { color: color.muted; }
    footer { border-top: 1px solid color.border; padding-top: space.3; }
  }

  base {
    use Surface;
    padding: space.5;
    display: flex;
    flex-direction: column;
    gap: space.3;
  }
}`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `const card = Card();

<article className={card.root}>
  <h3 className={card.title}>{title}</h3>
  <div className={card.body}>{children}</div>
  {footer && <footer className={card.footer}>{footer}</footer>}
</article>`,
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "Slot blocks cannot nest — icon { label { … } } is a parse error. Slots are a flat namespace per component; hierarchy lives in your markup, not the style definition.",
          "Docs note — slots: no nesting",
        ),
      },
    ],
  };
}

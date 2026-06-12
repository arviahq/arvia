import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function states(): DocSection {
  return {
    title: fbt("States", "Docs page title — States"),
    slug: "states",
    description: fbt(
      "Pseudo-classes, combinators, attribute selectors, and group hover.",
      "Docs page description — Pseudo-classes, combinators, and group hover.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "An `&-block` attaches a selector suffix to whatever the surrounding context styles. The & stands for “the element this rule targets” — write anything CSS accepts after it:",
          "Docs content — states: opening",
        ),
      },
      {
        type: "code",
        code: `component Button {
  base {
    background: color.primary;

    &:hover, &:focus-visible {
      filter: brightness(1.05);
    }

    &:active {
      transform: translateY(1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &::after {
      content: "";
    }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          'Selector lists expand per part — the first block above emits one rule with .Button_root_…:hover and .Button_root_…:focus-visible. Commas inside parentheses and brackets are respected, so &:not(:disabled, .off) and &[data-x="a,b"] split correctly.',
          "Docs content — states: selector lists",
        ),
      },
      { type: "h2", text: fbt("The suffix grammar", "Docs content — heading: suffix grammar") },
      {
        type: "p",
        text: fbt(
          "There is no whitelist of pseudo-classes — the text after & passes to the browser. Whitespace after & is significant, which gives you the full family of CSS relationships:",
          "Docs content — states: grammar lead-in",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Pattern", "Docs table header — pattern"),
          fbt("Meaning", "Docs table header — meaning"),
          fbt("Compiles to", "Docs table header — compiles to"),
        ],
        rows: [
          [
            "&:hover",
            fbt("Pseudo-class on the element itself", "Docs table cell — states pseudo"),
            ".X_root_h:hover",
          ],
          [
            "&::before",
            fbt("Pseudo-element", "Docs table cell — states pseudo-element"),
            ".X_root_h::before",
          ],
          [
            "&.active",
            fbt("Compound with another class (no gap)", "Docs table cell — states compound class"),
            ".X_root_h.active",
          ],
          [
            '&[aria-expanded="true"]',
            fbt("Attribute selector", "Docs table cell — states attribute"),
            '.X_root_h[aria-expanded="true"]',
          ],
          [
            "& .child",
            fbt("Descendant (gap after &)", "Docs table cell — states descendant"),
            ".X_root_h .child",
          ],
          ["& > svg", fbt("Direct child", "Docs table cell — states child"), ".X_root_h > svg"],
          [
            "&:not(:disabled):hover",
            fbt("Chained and functional pseudo-classes", "Docs table cell — states chained"),
            ".X_root_h:not(:disabled):hover",
          ],
        ],
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "&.active and & .active are different rules — compound versus descendant. The single space is the whole difference, exactly as in CSS nesting.",
          "Docs note — states: whitespace significant",
        ),
      },
      { type: "h2", text: fbt("Where states work", "Docs content — heading: where states work") },
      {
        type: "p",
        text: fbt(
          "States attach to every styling context: base, slot blocks, variant values, compound slot blocks, recipes, and styles. The condition scopes naturally — a state in a variant value only exists when that variant is active:",
          "Docs content — states: contexts lead-in",
        ),
      },
      {
        type: "code",
        code: `component Button {
  slots { root {} icon {} }

  base {
    &:hover { filter: brightness(1.03); }     // any button
    icon {
      &:hover { transform: rotate(8deg); }     // hovering the icon itself
    }
  }

  variants {
    tone {
      danger {
        &:hover { filter: brightness(1.1); }   // hover while danger
      }
    }
  }
}`,
      },
      {
        type: "h2",
        text: fbt("Group hover: states across slots", "Docs content — heading: group hover"),
      },
      {
        type: "p",
        text: fbt(
          "Inside base and variant bodies, a state block may contain slot blocks — “when the root matches this selector, style that slot.” This is the group-hover pattern, with no extra classes to manage:",
          "Docs content — states: group hover lead-in",
        ),
      },
      {
        type: "code",
        code: `component Button {
  slots { root {} icon {} }

  base {
    &:hover {
      opacity: 0.95;                            // the root itself
      icon { transform: translateX(2px); }      // the icon, on root hover
    }
  }
}`,
      },
      {
        type: "code",
        label: "generated CSS",
        lang: "css",
        code: `.Button_root_0p4oom:hover {
  opacity: 0.95;
}

.Button_root_0p4oom:hover .Button_icon_0p4oom {
  transform: translateX(2px);
}`,
      },
      {
        type: "p",
        text: fbt(
          "The slot is targeted through its base class, which is always present — the rule fires whatever variants are active. From a variant body, the same construct scopes to that variant: tone danger's `&:hover` { icon { … } } compiles against .Button_tone_danger_root_…:hover.",
          "Docs content — states: group hover semantics",
        ),
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "Slot blocks inside states are only legal in base and variant bodies — a recipe or style has no slots to refer to, so the checker rejects them there. And use is not allowed inside a state block; inline the declarations.",
          "Docs note — states: restrictions",
        ),
      },
      {
        type: "h2",
        text: fbt("Styling by ARIA and data attributes", "Docs content — heading: aria data"),
      },
      {
        type: "p",
        text: fbt(
          "Because the suffix is free-form, the accessibility-first patterns work directly — keep state in the DOM attributes you already set, and let CSS follow:",
          "Docs content — states: aria lead-in",
        ),
      },
      {
        type: "code",
        code: `component Tab {
  base {
    color: color.muted;

    &[aria-selected="true"] {
      color: color.text;
      border-bottom: 2px solid color.primary;
    }

    &[data-dragging] {
      opacity: 0.5;
    }
  }
}`,
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "Attribute states and variants overlap: both express “this element is selected.” Prefer the attribute when the browser or your framework already maintains it (aria-selected, :disabled); prefer a variant when it is app state that TypeScript should see.",
          "Docs note — states: attribute vs variant",
        ),
      },
    ],
  };
}

import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function components(): DocSection {
  return {
    title: fbt("Components", "Docs page title — Components"),
    slug: "components",
    description: fbt(
      "The core construct: anatomy, the implicit root, and the generated API.",
      "Docs page description — Component anatomy and generated APIs.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "A component is Arvia's main unit: a named bundle of styles that compiles to CSS classes plus a typed function for picking between them. Components scale from a one-liner to a multi-slot, multi-variant system — this page covers the anatomy; the linked pages go deep on each part.",
          "Docs content — components: opening",
        ),
      },
      {
        type: "h2",
        text: fbt("The simplest component", "Docs content — heading: simplest component"),
      },
      {
        type: "code",
        label: "badge.arv",
        code: `component Badge {
  padding: space.1 space.3;
  border-radius: radius.full;
  font-size: font.sm;
}`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { Badge } from "./badge.arv";

const styles = Badge();
<span className={styles.root}>New</span>`,
      },
      {
        type: "p",
        text: fbt(
          "Declarations written directly at the component's top level style the implicit root slot — every component has one, even without any block structure. This shorthand is the idiomatic form for simple components; the compiler treats it exactly as if the declarations sat inside base { }.",
          "Docs content — components: implicit root",
        ),
      },
      { type: "h2", text: fbt("The full anatomy", "Docs content — heading: full anatomy") },
      {
        type: "p",
        text: fbt(
          "Everything that can appear inside a component, in one place. All items are optional and may appear in any order:",
          "Docs content — components: anatomy lead-in",
        ),
      },
      {
        type: "code",
        code: `component Button {
  // Loose declarations — shorthand for base, style the root slot
  cursor: pointer;

  // Recipe inclusion at the root
  use FocusRing;

  base {                       // default styles for any slot + states
    display: inline-flex;
    gap: space.2;
    padding: metrics.pad;
    &:hover { filter: brightness(1.05); }
    icon { flex-shrink: 0; }   // slot block inside base
  }

  slots {                      // declare named parts
    root {}
    icon {}
    label { font-weight: 500; }
  }

  tokens {                     // component-scoped tokens
    metrics { pad = 6px; }
  }

  variants {                   // prop-driven axes
    size {
      sm { font-size: font.sm; }
      lg { font-size: font.md; }
    }
    tone {
      primary { background: color.primary; }
      danger  { background: color.danger; }
    }
  }

  defaults { size: sm; tone: primary; }

  compound {                   // extra styles for a combination
    size: sm;
    tone: danger;
    root { font-weight: 700; }
  }

  responsive {                 // variant overrides per breakpoint
    md { size: lg; }
  }

  container {                  // variant overrides per container width
    wide { size: lg; }
  }
}`,
      },
      {
        type: "table",
        headers: [
          fbt("Item", "Docs table header — item"),
          fbt("Purpose", "Docs table header — purpose"),
          fbt("Details", "Docs table header — details"),
        ],
        rows: [
          [
            "base { … }",
            fbt("Always-on styles for root, slots, and states.", "Docs table cell — base purpose"),
            fbt("One per component (ARV115 on duplicates).", "Docs table cell — base details"),
          ],
          [
            "slots { … }",
            fbt("Declares the component's named parts.", "Docs table cell — slots purpose"),
            fbt("See Slots.", "Docs table cell — slots details"),
          ],
          [
            "tokens { … }",
            fbt("Values visible only inside this component.", "Docs table cell — tokens purpose"),
            fbt("See Local tokens.", "Docs table cell — tokens details"),
          ],
          [
            "variants / defaults",
            fbt(
              "The component's prop axes and their fallbacks.",
              "Docs table cell — variants purpose",
            ),
            fbt("See Variants & defaults.", "Docs table cell — variants details"),
          ],
          [
            "compound { … }",
            fbt(
              "Styles gated on a combination of variant values.",
              "Docs table cell — compound purpose",
            ),
            fbt("See Compound variants.", "Docs table cell — compound details"),
          ],
          [
            "responsive / container",
            fbt(
              "Variant switching at breakpoints / container widths.",
              "Docs table cell — responsive purpose",
            ),
            fbt("See Responsive and Container queries.", "Docs table cell — responsive details"),
          ],
          [
            "use Recipe;",
            fbt("Pulls a recipe's declarations into the root.", "Docs table cell — use purpose"),
            fbt("See Recipes & use.", "Docs table cell — use details"),
          ],
        ],
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "Component names must be valid JavaScript identifiers since they become exports — my-button is rejected (ARV116), and two components with one name in a file collide (ARV110). PascalCase is the convention.",
          "Docs note — components: naming",
        ),
      },
      { type: "h2", text: fbt("The generated API", "Docs content — heading: generated api") },
      {
        type: "p",
        text: fbt(
          "Each component compiles to a function taking a props object and returning one class string per slot, plus the matching TypeScript declarations:",
          "Docs content — components: api lead-in",
        ),
      },
      {
        type: "code",
        label: "generated .d.ts",
        code: `export type ButtonProps = {
  size?: "sm" | "lg";        // optional — has a default
  tone?: "primary" | "danger";
};

export type ButtonSlots = {
  root: string;
  icon: string;
  label: string;
};

export declare function Button(props?: ButtonProps): ButtonSlots;`,
      },
      {
        type: "code",
        label: "App.tsx",
        code: `const styles = Button({ size: "lg" });

styles.root;  // "Button_root_0p4oom Button_size_lg_root_0p4oom Button_tone_primary_root_0p4oom"
styles.icon;  // "Button_icon_0p4oom Button_size_lg_icon_0p4oom"`,
      },
      {
        type: "p",
        text: fbt(
          "The function is pure and dependency-free: object lookups and string concatenation, nothing else. Call it during render, memoize it, or hoist constant calls to module scope — the result for the same props is always the same strings.",
          "Docs content — components: pure function",
        ),
      },
      { type: "h2", text: fbt("Class names you can read", "Docs content — heading: class names") },
      {
        type: "p",
        text: fbt(
          "Generated class names follow a fixed scheme — Component_variant_value_slot_hash — so DevTools stays legible: .Button_tone_danger_root_0p4oom tells you the component, why the class applied, the element it styles, and which file it came from. The 6-character hash comes from the file path and component name, not the styles, so names survive edits (see How compilation works).",
          "Docs content — components: class scheme",
        ),
      },
      { type: "h2", text: fbt("Wrapping for your framework", "Docs content — heading: wrapping") },
      {
        type: "p",
        text: fbt(
          "Arvia stops at class names on purpose — markup, refs, and accessibility stay yours. The typical React pattern is a thin wrapper that forwards everything else:",
          "Docs content — components: wrapper lead-in",
        ),
      },
      {
        type: "code",
        label: "Button.tsx",
        code: `import { Button as styles, type ButtonProps as StyleProps } from "./button.arv";

type Props = StyleProps & React.ComponentPropsWithoutRef<"button">;

export function Button({ size, tone, className, ...rest }: Props) {
  const s = styles({ size, tone });
  return <button {...rest} className={className ? \`\${s.root} \${className}\` : s.root} />;
}`,
      },
    ],
  };
}

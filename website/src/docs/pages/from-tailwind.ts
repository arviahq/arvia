import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function fromTailwind(): DocSection {
  return {
    title: fbt("Coming from Tailwind", "Docs page title — Coming from Tailwind"),
    slug: "from-tailwind",
    description: fbt(
      "Map utility-first habits onto tokens, variants, and compiled components.",
      "Docs page description — Migrating from Tailwind.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Tailwind and Arvia agree on the big things — design tokens enforced at build time, zero runtime styling — and disagree on where composition lives. Tailwind composes utilities in markup; Arvia compiles a component definition and hands your markup finished class names. Your Tailwind instincts map almost one-to-one:",
          "Docs content — tw: opening",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Tailwind concept", "Docs table header — tailwind concept"),
          fbt("Arvia equivalent", "Docs table header — arvia equivalent"),
        ],
        rows: [
          [
            fbt("theme scale in tailwind.config", "Docs table cell — tw config"),
            fbt(
              "`theme { }` block — tokens like `space.4`, `color.primary`",
              "Docs table cell — tw config arvia",
            ),
          ],
          [
            fbt("utility classes in className", "Docs table cell — tw utilities"),
            fbt(
              "declarations inside a `component` or `style`",
              "Docs table cell — tw utilities arvia",
            ),
          ],
          [
            "@apply",
            fbt(
              "`recipe` + `use` — composition without emitting classes",
              "Docs table cell — tw apply arvia",
            ),
          ],
          [
            "md:flex-row",
            fbt(
              "`responsive { md { layout: row; } }` or `{ initial, md }` props",
              "Docs table cell — tw responsive arvia",
            ),
          ],
          [
            "dark:bg-zinc-900",
            fbt(
              "`modes: light | dark;` + `@dark { }` token overrides",
              "Docs table cell — tw dark arvia",
            ),
          ],
          [
            "hover:opacity-90, focus-visible:ring",
            fbt("`&:hover { }`, `&:focus-visible { }` states", "Docs table cell — tw states arvia"),
          ],
          [
            "group-hover:translate-x-1",
            fbt(
              "cross-slot states: `&:hover { icon { … } }` — no group class needed",
              "Docs table cell — tw group arvia",
            ),
          ],
          [
            "@container / cq utilities",
            fbt(
              "`container { wide { … } }` blocks with `$wide` props",
              "Docs table cell — tw container arvia",
            ),
          ],
          [
            fbt("cva / tailwind-variants", "Docs table cell — tw cva"),
            fbt(
              "built in: `variants`, `defaults`, `compound` — fully typed",
              "Docs table cell — tw cva arvia",
            ),
          ],
        ],
      },
      { type: "h2", text: fbt("The same button, twice", "Docs content — heading: tw button") },
      {
        type: "code",
        label: "Tailwind (with cva)",
        code: `const button = cva(
  "inline-flex items-center gap-2 rounded-lg font-medium transition hover:brightness-105",
  {
    variants: {
      size: { sm: "px-3 py-1 text-sm", lg: "px-5 py-3 text-base" },
      tone: { primary: "bg-indigo-600 text-white", danger: "bg-red-600 text-white" },
    },
    compoundVariants: [{ size: "sm", tone: "danger", class: "font-bold uppercase" }],
    defaultVariants: { size: "sm", tone: "primary" },
  },
);`,
      },
      {
        type: "code",
        label: "button.arv",
        code: `component Button {
  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    border-radius: radius.md;
    font-weight: 500;
    transition: filter duration.fast;
    &:hover { filter: brightness(1.05); }
  }

  variants {
    size {
      sm { padding: space.1 space.3; font-size: font.sm; }
      lg { padding: space.3 space.5; font-size: font.md; }
    }
    tone {
      primary { background: color.primary; color: white; }
      danger  { background: color.danger; color: white; }
    }
  }

  defaults { size: sm; tone: primary; }

  compound {
    size: sm;
    tone: danger;
    root { font-weight: 700; text-transform: uppercase; }
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          'Same decision space, different home: the definition moved out of a JS helper into a compiled file, the strings became checked declarations, and the variant props are typed without `VariantProps` gymnastics. The call site is what cva gives you, minus the className assembly: `Button({ size: "lg" }).root`.',
          "Docs content — tw: button comparison",
        ),
      },
      { type: "h2", text: fbt("What you stop doing", "Docs content — heading: tw stop doing") },
      {
        type: "ul",
        items: [
          fbt(
            "Scanning long className strings to find which utility sets the padding — each property appears once, in a named place.",
            "Docs list item — tw stop scanning",
          ),
          fbt(
            "Fighting class-merge order with twMerge — variants, compounds, and utilities have a defined cascade order (see [FAQ](/docs/faq)).",
            "Docs list item — tw stop merge",
          ),
          fbt(
            "Inventing group/peer classes for parent-state styling — cross-slot states compile the descendant selector for you.",
            "Docs list item — tw stop group",
          ),
        ],
      },
      { type: "h2", text: fbt("What to watch out for", "Docs content — heading: tw gotchas") },
      {
        type: "ul",
        items: [
          fbt(
            "No arbitrary values in markup. `w-[137px]` becomes a declaration in the component — or a [local token](/docs/local-tokens) when the magic number deserves a name.",
            "Docs list item — tw gotcha arbitrary",
          ),
          fbt(
            "Utilities still exist, as `style` declarations — but reach for them after components, not before. The Tailwind habit of composing five utilities per element usually wants to be one component with variants.",
            "Docs list item — tw gotcha utilities",
          ),
          fbt(
            "Responsive overrides switch whole variant values, not single properties. Group what changes at a breakpoint into a variant (`layout: stacked | row`) instead of overriding properties one by one.",
            "Docs list item — tw gotcha responsive",
          ),
        ],
      },
    ],
  };
}

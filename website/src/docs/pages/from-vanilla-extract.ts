import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function fromVanillaExtract(): DocSection {
  return {
    title: fbt("Coming from vanilla-extract", "Docs page title — Coming from vanilla-extract"),
    slug: "from-vanilla-extract",
    description: fbt(
      "Same zero-runtime philosophy, expressed as a language instead of a TypeScript API.",
      "Docs page description — Migrating from vanilla-extract.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "vanilla-extract is Arvia's closest relative: build-time CSS, typed themes, a recipes API for variants. The shift is from describing styles with TypeScript values to describing them in a dedicated language — trading TS expressiveness inside style files for CSS-native syntax, a compiler with did-you-mean diagnostics, and slots/states without selector objects. The APIs map nearly one-to-one:",
          "Docs content — ve: opening",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("vanilla-extract", "Docs table header — ve concept"),
          fbt("Arvia", "Docs table header — ve arvia"),
        ],
        rows: [
          [
            "createGlobalTheme / createTheme",
            fbt(
              "`theme { }` — one shared theme, `modes:` for variants of it",
              "Docs table cell — ve theme arvia",
            ),
          ],
          [
            "style({ … }) exported const",
            fbt(
              "`style name { }` — same concept, same export shape",
              "Docs table cell — ve style arvia",
            ),
          ],
          [
            "recipe({ base, variants, compoundVariants, defaultVariants })",
            fbt(
              "`component` with `base` / `variants` / `compound` / `defaults`",
              "Docs table cell — ve recipe arvia",
            ),
          ],
          [
            'selectors: { "&:hover": { } }',
            fbt(
              "`&:hover { }` — selector syntax instead of object keys",
              "Docs table cell — ve selectors arvia",
            ),
          ],
          [
            'globalStyle("body", { })',
            fbt("`global { body { } }`", "Docs table cell — ve global arvia"),
          ],
          [
            "keyframes({ from, to })",
            fbt(
              "`keyframes name { from { } to { } }` — hashed the same way",
              "Docs table cell — ve keyframes arvia",
            ),
          ],
          [
            "sprinkles(…)",
            fbt(
              "no direct equivalent — tokens + `style` utilities cover most uses",
              "Docs table cell — ve sprinkles arvia",
            ),
          ],
          [
            "@media keys in style objects",
            fbt(
              "`responsive { }` / `container { }` blocks switching variants",
              "Docs table cell — ve media arvia",
            ),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("recipe() → component, line by line", "Docs content — heading: ve recipe"),
      },
      {
        type: "code",
        label: "button.css.ts (before)",
        code: `export const button = recipe({
  base: { display: "inline-flex", gap: vars.space[2], borderRadius: vars.radius.md },
  variants: {
    size: {
      sm: { padding: \`\${vars.space[1]} \${vars.space[3]}\` },
      lg: { padding: \`\${vars.space[3]} \${vars.space[5]}\` },
    },
    tone: {
      primary: { background: vars.color.primary },
      danger: { background: vars.color.danger },
    },
  },
  compoundVariants: [
    { variants: { size: "sm", tone: "danger" }, style: { fontWeight: 700 } },
  ],
  defaultVariants: { size: "sm", tone: "primary" },
});`,
      },
      {
        type: "code",
        label: "button.arv (after)",
        code: `component Button {
  base {
    display: inline-flex;
    gap: space.2;
    border-radius: radius.md;
  }

  variants {
    size {
      sm { padding: space.1 space.3; }
      lg { padding: space.3 space.5; }
    }
    tone {
      primary { background: color.primary; }
      danger  { background: color.danger; }
    }
  }

  compound {
    size: sm;
    tone: danger;
    root { font-weight: 700; }
  }

  defaults { size: sm; tone: primary; }
}`,
      },
      {
        type: "p",
        text: fbt(
          'Every key found its block; the template-literal token plumbing (`vars.space[1]`) became plain references with compiler checking. The call site is identical in spirit — `button({ size: "lg" })` returned one class string; `Button({ size: "lg" })` returns one per slot, so multi-element components stop needing a second and third `style()` export.',
          "Docs content — ve: recipe comparison",
        ),
      },
      { type: "h2", text: fbt("What Arvia adds on top", "Docs content — heading: ve adds") },
      {
        type: "ul",
        items: [
          fbt(
            "[Slots](/docs/slots) — one definition styles root, icon, and label together, with cross-slot states (`&:hover { icon { … } }`) that recipes can't express without manual selectors.",
            "Docs list item — ve adds slots",
          ),
          fbt(
            "[Responsive](/docs/responsive) and [container](/docs/container-queries) variant switching, including the typed `{ initial, md, $wide }` call-site form.",
            "Docs list item — ve adds responsive",
          ),
          fbt(
            "A language server: token hover with values, completion, go-to-definition, and did-you-mean fixes in `.arv` files — beyond what generic TS tooling sees inside style objects.",
            "Docs list item — ve adds lsp",
          ),
        ],
      },
      { type: "h2", text: fbt("What to watch out for", "Docs content — heading: ve gotchas") },
      {
        type: "ul",
        items: [
          fbt(
            "No JavaScript inside style files: loops, helper functions, and computed style objects don't exist in `.arv`. Repetition is handled by [recipes](/docs/recipes) and [tokens](/docs/theme); anything truly dynamic moves to the call site (see the [FAQ](/docs/faq)).",
            "Docs list item — ve gotcha no js",
          ),
          fbt(
            "One shared theme contract instead of multiple `createTheme` instances: alternate themes are `modes:` on the same token set, switched with `data-arvia-theme` — not differently-shaped theme objects.",
            "Docs list item — ve gotcha themes",
          ),
          fbt(
            "Sprinkles-style atomic props have no direct counterpart. The common 80% — a constrained set of spacing/color values — is what tokens already enforce; for layout primitives, build a small `Box`-like component with variants.",
            "Docs list item — ve gotcha sprinkles",
          ),
        ],
      },
    ],
  };
}

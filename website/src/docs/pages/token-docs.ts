import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function tokenDocs(): DocSection {
  return {
    title: fbt("Token docs", "Docs page title — Token docs"),
    slug: "token-docs",
    description: fbt(
      "Attach documentation to tokens — it follows them into editors, types, and catalogs.",
      "Docs page description — Document tokens for designers and developers.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          'A token\'s name says what it is; a doc string says when to use it. Append doc "…" to any token value:',
          "Docs content — token docs: opening",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `theme {
  color {
    primary = #635bff doc "Brand primary — CTAs and links";
    danger = #e5484d doc "Destructive actions only; pair with confirmation";
    surface = #ffffff doc "Default card and panel background";
  }

  space {
    1 = 4px doc "Hairline gaps: icon-to-label, badge padding";
    4 = 16px doc "Default block spacing";
  }
}`,
      },
      {
        type: "h2",
        text: fbt("Where the docs surface", "Docs content — heading: where docs surface"),
      },
      {
        type: "ul",
        items: [
          fbt(
            "Editor hover — the language server shows the doc string together with the token's value (and per-mode values) wherever the token is referenced.",
            "Docs list item — token docs: hover",
          ),
          fbt(
            "Generated types — doc strings become JSDoc on the tokens export, so tokens.color.primary carries its documentation into TypeScript autocomplete.",
            "Docs list item — token docs: jsdoc",
          ),
          fbt(
            "Token catalogs — arvia gen --docs renders a browsable reference from the same strings.",
            "Docs list item — token docs: catalogs",
          ),
        ],
      },
      {
        type: "code",
        label: "generated .d.ts (excerpt)",
        code: `export declare const tokens: {
  readonly color: {
    /** Brand primary — CTAs and links */
    readonly primary: string;
  };
};`,
      },
      {
        type: "h2",
        text: fbt("Generating a catalog", "Docs content — heading: generating catalog"),
      },
      {
        type: "code",
        label: "terminal",
        code: `arvia gen --docs --theme src/theme.arv --out docs/tokens
# or machine-readable:
arvia gen --docs --format json --theme src/theme.arv --out docs/tokens`,
      },
      {
        type: "p",
        text: fbt(
          "The Markdown output lists every group with names, values, mode overrides, and doc strings — ready for a design-system wiki. The JSON form feeds custom tooling: Figma sync, visual regression baselines, or a styleguide page that renders swatches.",
          "Docs content — token docs: catalog outputs",
        ),
      },
      {
        type: "h2",
        text: fbt("Writing docs worth reading", "Docs content — heading: writing good docs"),
      },
      {
        type: "ul",
        items: [
          fbt(
            "Document the decision, not the value — “CTAs and links” helps; “purple” is already visible.",
            "Docs list item — token docs: decision not value",
          ),
          fbt(
            "State the boundary for near-duplicates: if muted and subtle coexist, their doc strings should say which to pick.",
            "Docs list item — token docs: boundaries",
          ),
          fbt(
            "Cover the scale's grammar once — a doc on space.1 explaining the step logic teaches the whole group.",
            "Docs list item — token docs: scale grammar",
          ),
        ],
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "Doc strings attach to theme tokens only. Component-local tokens are implementation details and never reach catalogs or exports — if a value deserves documentation for others, that is a sign it belongs in the theme.",
          "Docs note — token docs: theme only",
        ),
      },
    ],
  };
}

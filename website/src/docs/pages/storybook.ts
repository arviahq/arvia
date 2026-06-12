import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function storybook(): DocSection {
  return {
    title: fbt("Storybook", "Docs page title — Storybook"),
    slug: "storybook",
    description: fbt(
      "Generate CSF stories from your components' variants — for free.",
      "Docs page description — Auto-generate stories from component variants.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "A component's variants, values, defaults, and slots are exactly the information a good story needs — so the generator derives stories from them instead of you writing both:",
          "Docs content — storybook: opening",
        ),
      },
      {
        type: "code",
        label: "terminal",
        code: `npm install -D @arviahq/storybook
arvia gen --storybook --theme src/theme.arv --out stories src/`,
      },
      {
        type: "p",
        text: fbt(
          "For each component the generator emits a CSF file with: controls for every variant axis (typed as its value union), defaults pre-selected, a story per variant value so the matrix is browsable at a glance, and markup that wires every slot so multi-element components render meaningfully.",
          "Docs content — storybook: what is generated",
        ),
      },
      { type: "h2", text: fbt("Workflow", "Docs content — heading: storybook workflow") },
      {
        type: "p",
        text: fbt(
          "Generated stories are a starting grid, not a cage. Two common setups:",
          "Docs content — storybook: workflow lead-in",
        ),
      },
      {
        type: "ul",
        items: [
          fbt(
            "Fully generated — .gitignore the output directory and regenerate in CI; stories track components automatically and never drift.",
            "Docs list item — storybook generated mode",
          ),
          fbt(
            "Generate once, then own — commit the output and edit freely (real content, interaction tests); regenerate selectively when a component's API changes.",
            "Docs list item — storybook owned mode",
          ),
        ],
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "Stories import your .arv files, so the Storybook build needs the Arvia Vite plugin too — add arvia() to the Vite config Storybook uses, with the same theme path as your app.",
          "Docs note — storybook: vite config",
        ),
      },
      {
        type: "p",
        text: fbt(
          "To see a complete setup, run pnpm demo:storybook in the Arvia monorepo — it generates stories for the demo components and boots Storybook on them.",
          "Docs content — storybook: demo pointer",
        ),
      },
    ],
  };
}

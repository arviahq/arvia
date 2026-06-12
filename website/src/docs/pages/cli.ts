import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function cli(): DocSection {
  return {
    title: fbt("CLI", "Docs page title — CLI"),
    slug: "cli",
    description: fbt(
      "arvia gen: type declarations, token catalogs, and Storybook stories.",
      "Docs page description — Generate types and docs without running Vite.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "The arvia CLI ships with every Vite plugin package and has one command, gen, with three modes: emit TypeScript declarations (the default), generate a token catalog (--docs), or generate Storybook stories (--storybook).",
          "Docs content — cli: opening",
        ),
      },
      {
        type: "code",
        label: "terminal",
        code: `arvia gen [dir] [--theme <path>] [--storybook|--docs] [--out <dir>] [--format md|json]`,
      },
      {
        type: "table",
        headers: [
          fbt("Flag", "Docs table header — flag"),
          fbt("Meaning", "Docs table header — flag meaning"),
        ],
        rows: [
          [
            "[dir]",
            fbt(
              "Directory to scan for .arv files (default: current directory; node_modules is skipped).",
              "Docs table cell — cli dir",
            ),
          ],
          [
            "--theme <path>",
            fbt(
              "The shared theme file. Default: the first theme.arv found under [dir].",
              "Docs table cell — cli theme",
            ),
          ],
          [
            "--docs",
            fbt(
              "Generate a design-token catalog instead of declarations.",
              "Docs table cell — cli docs",
            ),
          ],
          [
            "--storybook",
            fbt("Generate CSF stories instead of declarations.", "Docs table cell — cli storybook"),
          ],
          [
            "--out <dir>",
            fbt(
              "Output directory for --docs (default docs/tokens) and --storybook (default stories).",
              "Docs table cell — cli out",
            ),
          ],
          [
            "--format md|json",
            fbt("Catalog format for --docs (default md).", "Docs table cell — cli format"),
          ],
        ],
      },
      {
        type: "h2",
        text: fbt("Generating declarations", "Docs content — heading: cli declarations"),
      },
      {
        type: "code",
        label: "terminal",
        code: `arvia gen src/
# generated src/theme.arv.d.ts
# generated src/button.arv.d.ts
# …`,
      },
      {
        type: "p",
        text: fbt(
          "Each file compiles against the theme and gets a sibling .d.ts. Use this in environments where the TypeScript plugin cannot run — CI without arvia-tsc, or non-TS consumers of your design system package. Diagnostics print with file and line; any error makes the command exit non-zero, which doubles as a lint step for .arv sources.",
          "Docs content — cli: declarations semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("Token catalogs and stories", "Docs content — heading: cli catalogs stories"),
      },
      {
        type: "code",
        label: "terminal",
        code: `# Markdown token reference for your design-system wiki
arvia gen --docs --theme src/theme.arv --out docs/tokens

# JSON for custom tooling (Figma sync, swatch pages)
arvia gen --docs --format json --theme src/theme.arv --out docs/tokens

# CSF stories from every component's variants and defaults
arvia gen --storybook --theme src/theme.arv --out stories src/`,
      },
      {
        type: "p",
        text: fbt(
          "Catalog generation is covered in Token docs; story generation in Storybook. Both modes load their generator packages (@arviahq/docs, @arviahq/storybook) on demand — install the one you use.",
          "Docs content — cli: modes pointers",
        ),
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "For day-to-day type checking prefer arvia-tsc (from the TypeScript plugin package) over generated siblings: it type-checks .arv imports virtually, leaving your working tree clean.",
          "Docs note — cli: prefer arvia-tsc",
        ),
      },
    ],
  };
}

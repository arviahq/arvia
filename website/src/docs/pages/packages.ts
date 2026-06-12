import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function packages(): DocSection {
  return {
    title: fbt("Packages", "Docs page title — Packages"),
    slug: "packages",
    description: fbt(
      "What lives under @arviahq, and which packages your project actually needs.",
      "Docs page description — npm packages under @arviahq.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Most projects install exactly two packages: the Vite plugin for their framework and the TypeScript plugin. Everything else is either pulled in as a dependency or installed on demand for specific tooling:",
          "Docs content — packages: opening",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Package", "Docs table header — package"),
          fbt("What it is", "Docs table header — package what"),
          fbt("Install it when", "Docs table header — install when"),
        ],
        rows: [
          [
            "@arviahq/vite-plugin-react",
            fbt("Vite plugin + arvia CLI for React projects.", "Docs table cell — pkg react"),
            fbt("You use React + Vite.", "Docs table cell — pkg react when"),
          ],
          [
            "@arviahq/vite-plugin-preact",
            fbt("Vite plugin + arvia CLI for Preact projects.", "Docs table cell — pkg preact"),
            fbt("You use Preact + Vite.", "Docs table cell — pkg preact when"),
          ],
          [
            "@arviahq/vite-plugin-vue",
            fbt("Vite plugin + arvia CLI for Vue projects.", "Docs table cell — pkg vue"),
            fbt("You use Vue + Vite.", "Docs table cell — pkg vue when"),
          ],
          [
            "@arviahq/typescript-plugin",
            fbt(
              "tsserver plugin + arvia-tsc; serves .arv types virtually.",
              "Docs table cell — pkg ts",
            ),
            fbt("Always, alongside any Vite plugin.", "Docs table cell — pkg ts when"),
          ],
          [
            "@arviahq/vite-plugin",
            fbt(
              "The framework-agnostic core the framework plugins re-export.",
              "Docs table cell — pkg core vite",
            ),
            fbt(
              "You integrate a framework without an official plugin.",
              "Docs table cell — pkg core vite when",
            ),
          ],
          [
            "@arviahq/compiler",
            fbt(
              "The compiler itself: compile(), analyze(), diagnostics.",
              "Docs table cell — pkg compiler",
            ),
            fbt("You build custom tooling on top of Arvia.", "Docs table cell — pkg compiler when"),
          ],
          [
            "@arviahq/language-server",
            fbt("LSP server for .arv files.", "Docs table cell — pkg lsp"),
            fbt(
              "Editor setups without a bundled extension (e.g. Neovim).",
              "Docs table cell — pkg lsp when",
            ),
          ],
          [
            "@arviahq/storybook",
            fbt(
              "CSF story generator behind arvia gen --storybook.",
              "Docs table cell — pkg storybook",
            ),
            fbt("You generate stories from components.", "Docs table cell — pkg storybook when"),
          ],
          [
            "@arviahq/docs",
            fbt("Token catalog generator behind arvia gen --docs.", "Docs table cell — pkg docs"),
            fbt("You publish a token reference.", "Docs table cell — pkg docs when"),
          ],
        ],
      },
      { type: "h2", text: fbt("A typical setup", "Docs content — heading: typical setup") },
      {
        type: "code",
        label: "terminal",
        code: `npm install -D @arviahq/vite-plugin-react @arviahq/typescript-plugin`,
      },
      {
        type: "p",
        text: fbt(
          "The framework plugins bundle the compiler and re-export the arvia CLI, so the two-package install covers building, type checking, and code generation. Editor extensions (VS Code, Zed) ship their own copy of the language server.",
          "Docs content — packages: typical setup explanation",
        ),
      },
      { type: "h2", text: fbt("Versioning", "Docs content — heading: versioning") },
      {
        type: "p",
        text: fbt(
          "All packages release in lockstep from one repository — keep them on matching versions. If types and build output ever disagree, the first thing to check is a version skew between the Vite plugin and the TypeScript plugin.",
          "Docs content — packages: versioning",
        ),
      },
    ],
  };
}

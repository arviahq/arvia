import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function vitePlugin(): DocSection {
  return {
    title: fbt("Vite plugin", "Docs page title — Vite plugin"),
    slug: "vite-plugin",
    description: fbt(
      "How .arv imports compile, the options, and the HMR model.",
      "Docs page description — Compile .arv files at build time with HMR.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "The Vite plugin makes .arv files importable modules: each import compiles to the generated JavaScript, with the CSS routed through Vite's own pipeline. The integration is identical across frameworks — only the JSX plugin next to it differs:",
          "Docs content — vite: opening",
        ),
      },
      {
        type: "code",
        label: "vite.config.ts",
        code: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [
    arvia({
      theme: "src/theme.arv", // shared theme (default: src/theme.arv if present)
      dts: false,             // sibling .d.ts files (default: false)
    }),
    react(),
  ],
});`,
      },
      {
        type: "table",
        headers: [
          fbt("Option", "Docs table header — option"),
          fbt("Default", "Docs table header — default"),
          fbt("Meaning", "Docs table header — meaning"),
        ],
        rows: [
          [
            "theme",
            fbt("src/theme.arv when it exists", "Docs table cell — vite theme default"),
            fbt(
              "Path (relative to the Vite root) of the file whose tokens, recipes, and keyframes every .arv file can see.",
              "Docs table cell — vite theme meaning",
            ),
          ],
          [
            "dts",
            "false",
            fbt(
              "Write sibling .d.ts files next to each .arv file. Off by default — types come virtually from the TypeScript plugin; sibling files would shadow them.",
              "Docs table cell — vite dts meaning",
            ),
          ],
        ],
      },
      { type: "h2", text: fbt("How an import flows", "Docs content — heading: import flow") },
      {
        type: "p",
        text: fbt(
          "When a module imports button.arv, the plugin compiles it against the shared theme environment and returns the generated JS with one line prepended: an import of the phantom module button.arv.css. That module does not exist on disk — the plugin serves the compiled CSS under that name, which hands styling to Vite's CSS pipeline: dev-server injection, build-time extraction, minification, and code-split CSS chunks all behave exactly as for a real stylesheet.",
          "Docs content — vite: phantom css",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Compile errors surface as Vite errors with file, line, and column — the dev overlay points at the .arv source. Warnings (unknown property, unused recipe…) reach the terminal without blocking the build.",
          "Docs content — vite: diagnostics flow",
        ),
      },
      { type: "h2", text: fbt("The HMR model", "Docs content — heading: hmr model") },
      {
        type: "table",
        headers: [
          fbt("You edit", "Docs table header — you edit"),
          fbt("What happens", "Docs table header — what happens"),
        ],
        rows: [
          [
            fbt("Style values in a component file", "Docs table cell — hmr style edit"),
            fbt(
              "The JS is byte-identical (class names are path-hashed), so only the phantom CSS module updates — styles swap in place, no re-render.",
              "Docs table cell — hmr style result",
            ),
          ],
          [
            fbt(
              "Structure in a component file (new variant, slot, default)",
              "Docs table cell — hmr structure edit",
            ),
            fbt(
              "JS changed too — the module and its CSS update through the normal HMR graph.",
              "Docs table cell — hmr structure result",
            ),
          ],
          [
            fbt("The shared theme file", "Docs table cell — hmr theme edit"),
            fbt(
              "Tokens may be inlined anywhere, so all caches reset and the page fully reloads. Theme edits are the expensive ones by design.",
              "Docs table cell — hmr theme result",
            ),
          ],
          [
            fbt("Create or delete .arv files", "Docs table cell — hmr add remove"),
            fbt(
              "Watched: new files compile on first import (and get types immediately in dts mode); deleting a file cleans its caches and generated siblings.",
              "Docs table cell — hmr add remove result",
            ),
          ],
        ],
      },
      { type: "h2", text: fbt("Cross-file name collisions", "Docs content — heading: collisions") },
      {
        type: "p",
        text: fbt(
          "Two files may both export a Button — hashes keep their CSS apart, and the plugin warns about the duplication since importing both into one module would force aliasing. The warning lists the files; rename one or alias at the import site.",
          "Docs content — vite: collisions",
        ),
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          'Keep arvia() before the framework plugin in the plugins array. It declares enforce: "pre" and must transform .arv imports before anything else interprets them.',
          "Docs note — vite: plugin order",
        ),
      },
    ],
  };
}

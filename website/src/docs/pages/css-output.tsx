import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocH3 } from "../../components/docs/DocH3";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocLi } from "../../components/docs/DocLi";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocTable } from "../../components/docs/DocTable";
import type { DocPageMeta } from "../registry";

export const css_outputMeta: DocPageMeta = {
  slug: "css-output",
  title: <fbt desc="Docs page title — CSS output">{"CSS output"}</fbt>,
  description: (
    <fbt desc="Docs page description — CSS output modes.">
      {
        "Per-component CSS files, a shared global.css, a manifest, SSR collection, and library publishing — alongside the bundled app CSS."
      }
    </fbt>
  ),
  nav: { section: "deep-dives", order: 1.5 },
  searchText:
    "Arvia compiles each .arv file independently and your bundler (Vite/Rollup) merges the per-file CSS into one asset for an app build. On top of that, component mode emits a structured CSS tree: a shared global.css, one components/<Name>.css per component, and a manifest.json. Set it with the css.output option (component default, single, chunk reserved). single skips the structured tree; the app bundling path and HMR are identical for both. The structured tree is written to .arvia/css by default (css.dir), NOT into dist/assets — dist/assets stays a single merged file because Vite bundles the per-file CSS, which is optimal for an app. global.css aggregates and deduplicates every file's shared CSS; a @keyframes used by more than one component is promoted to global.css. css.layers wraps the output in cascade layers @layer arvia.tokens, arvia.reset, arvia.base, arvia.components, arvia.utilities. CLI: arvia gen --css --css-dir --layers. The manifest is importable as virtual:arvia/css-manifest; reference @arviahq/runtime/client for its type. For SSR use @arviahq/runtime: collectArviaCss, ArviaCssCollector, arviaCssLinks resolve the manifest to the stylesheets a render used. Library mode: css.libraryMode flips css.importStrategy to manual so the emitted JS has no automatic CSS side-effect import; consumers import the published global.css and components/*.css themselves. side-effect is the app default.",
};

export function CssOutputPage() {
  return (
    <DocArticle meta={css_outputMeta}>
      <DocP>
        <fbt desc="Docs content — css-output: intro">
          {
            "Arvia compiles each `.arv` file independently, and your bundler (Vite/Rollup) merges the per-file CSS into one asset for an app build. On top of that, Arvia can emit a *structured CSS tree* — a shared `global.css` plus one file per component, with a manifest — for design-system publishing, manifest-driven SSR, and per-component caching."
          }
        </fbt>
      </DocP>

      <DocH2>
        <fbt desc="Docs content — css-output: heading modes">{"Output modes"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css-output: modes intro">
          {
            "Set the mode via the Vite plugin's `css.output` option (or the compiler's `cssOutput`):"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"vite.config.ts"}
        code={`import { arvia } from "@arviahq/vite-plugin-react";

export default defineConfig({
  plugins: [arvia({ css: { output: "component" } })],
});`}
      />
      <DocTable
        headers={[
          <fbt desc="css-output table header — mode">{"Mode"}</fbt>,
          <fbt desc="css-output table header — behaviour">{"Behaviour"}</fbt>,
        ]}
        rows={[
          [
            `"component"`,
            <fbt desc="css-output cell — component">
              {
                "**Default.** Emits the structured CSS tree (below) at build time and via `arvia gen --css`."
              }
            </fbt>,
          ],
          [
            `"single"`,
            <fbt desc="css-output cell — single">
              {"Skips the structured tree. Simplest for static sites and older bundlers."}
            </fbt>,
          ],
          [
            `"chunk"`,
            <fbt desc="css-output cell — chunk">
              {"Reserved for a future grouping mode; currently errors."}
            </fbt>,
          ],
        ]}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — css-output: app path unchanged">
          {
            "The app bundling path is identical for `single` and `component` — Vite still merges the per-file CSS into one asset and HMR is unchanged. The mode only governs the *additional* structured output on disk."
          }
        </fbt>
      </DocCallout>

      <DocH2>
        <fbt desc="Docs content — css-output: heading tree">{"The structured output tree"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css-output: tree intro">
          {"In `component` mode, a production build (and `arvia gen --css`) writes:"}
        </fbt>
      </DocP>
      <DocCode
        label={".arvia/css/"}
        code={`.arvia/css/
  global.css            // tokens, themes, resets, base, utilities, shared keyframes
  components/
    Button.css
    Card.css
  manifest.json         // { "global": "global.css", "components": { "Button": "components/Button.css" } }
  .gitignore            // self-ignoring; the tree is generated, never committed`}
      />
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — css-output: global">
            {
              "`global.css` aggregates every file's shared CSS, **deduplicated** across files (an identical reset or `:root` block appears once)."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — css-output: per component">
            {"`components/<Name>.css` holds one component's scoped rules."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — css-output: keyframe promotion">
            {
              "A `@keyframes` defined identically by more than one component is **promoted** to `global.css` and removed from each component, so a shared animation ships once."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocP>
        <fbt desc="Docs content — css-output: dir">
          {"Configure the location with `css.dir` (default `.arvia/css`)."}
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — css-output: dist vs arvia">
          {
            "This tree is written straight to disk, *outside* your bundler's asset pipeline — so it does **not** appear in `dist/assets`. An app build's `dist/assets/*.css` stays a single merged file (that is Vite bundling the per-file CSS, which is optimal for a single-page app). The `.arvia/css` tree is the publishable / SSR artifact."
          }
        </fbt>
      </DocCallout>

      <DocH3>
        <fbt desc="Docs content — css-output: heading layers">{"Cascade layers"}</fbt>
      </DocH3>
      <DocP>
        <fbt desc="Docs content — css-output: layers">
          {
            "Enable `css.layers: true` to wrap the output in cascade layers so import order can never change the result:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"global.css"}
        code={`@layer arvia.tokens, arvia.reset, arvia.base, arvia.components, arvia.utilities;`}
      />
      <DocP>
        <fbt desc="Docs content — css-output: layers note">
          {
            "This changes cascade resolution, so it is opt-in. It does not affect the bundled app CSS."
          }
        </fbt>
      </DocP>

      <DocH2>
        <fbt desc="Docs content — css-output: heading cli">{"From the CLI"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css-output: cli">
          {
            "`arvia gen --css` runs the same whole-project aggregation the build does, over every `.arv` file under the target directory:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"shell"}
        code={`arvia gen --css                      # emit the structured tree into .arvia/css
arvia gen --css --css-dir dist/arvia # choose the output directory
arvia gen --css --layers             # with cascade layers`}
      />

      <DocH2>
        <fbt desc="Docs content — css-output: heading ssr">{"SSR"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css-output: ssr manifest">
          {
            "The build emits `manifest.json`; the plugin also exposes it as a virtual module. Add the ambient type once so the import is typed:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"arvia-env.d.ts"}
        code={`/// <reference types="@arviahq/runtime/client" />`}
      />
      <DocP>
        <fbt desc="Docs content — css-output: ssr collect">
          {"Use `@arviahq/runtime` to send only the CSS a request actually rendered:"}
        </fbt>
      </DocP>
      <DocCode
        label={"server.ts"}
        code={`import { ArviaCssCollector, arviaCssLinks } from "@arviahq/runtime";
import manifest from "virtual:arvia/css-manifest";

const css = new ArviaCssCollector();
css.use("Button", "Card"); // mark components as they render

const head = arviaCssLinks(css.collect(manifest, { base: "/assets/arvia" }));
// → <link rel="stylesheet" href="/assets/arvia/global.css"><link ...Button.css">`}
      />
      <DocP>
        <fbt desc="Docs content — css-output: ssr primitive">
          {
            "`collectArviaCss(names, manifest, options)` is the underlying primitive: it returns `global.css` first, then each requested component's stylesheet, dropping unknown names and duplicates."
          }
        </fbt>
      </DocP>

      <DocH2>
        <fbt desc="Docs content — css-output: heading library">{"Library / publishing mode"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css-output: library intro">
          {
            "For a published design system, the emitted JS should not hard-depend on a bundler-specific CSS side-effect import; consumers import the published CSS themselves."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"vite.config.ts"}
        code={`arvia({ css: { libraryMode: true } }); // ⇒ importStrategy defaults to "manual"`}
      />
      <DocP>
        <fbt desc="Docs content — css-output: import strategy">{"`css.importStrategy`:"}</fbt>
      </DocP>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — css-output: side-effect">
            {
              "`'side-effect'` (app default) — the generated JS auto-imports its CSS, so styles load just by importing the component."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — css-output: manual">
            {
              "`'manual'` / `'manifest'` — no auto-import; bring the CSS in yourself (via the published `global.css` / `components/*.css`, or the manifest / SSR collection)."
            }
          </fbt>
        </DocLi>
      </DocUl>
      <DocCode
        label={"package.json"}
        code={`{
  "exports": {
    "./global.css": "./dist/arvia/global.css",
    "./Button.css": "./dist/arvia/components/Button.css"
  }
}`}
      />

      <DocH2>
        <fbt desc="Docs content — css-output: heading migration">{"Migration"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css-output: migration">
          {
            "`component` is the default. Existing apps need no change — bundled output and HMR are unchanged. To opt back into the previous single-string behaviour for a simple site or an older bundler, set `css: { output: 'single' }`."
          }
        </fbt>
      </DocP>

      <DocH3>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH3>
      <DocP>
        <fbt desc="Docs content — css-output: related">
          {
            "[CSS & at-rules](/docs/css) · [Global styles](/docs/global) · [Compilation](/docs/compilation) · [CLI](/docs/cli) · [Vite plugin](/docs/vite-plugin)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}

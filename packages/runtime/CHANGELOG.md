# @arviahq/runtime

## 2.1.0

### Minor Changes

- c59a3f2: Add per-component CSS output, a CSS manifest, SSR collection, and library mode

  Arvia can now emit a structured CSS tree in addition to the per-file CSS that the bundler merges for apps. A new `css.output` mode (`"component"`, the default) writes a deduplicated shared `global.css`, one `components/<Name>.css` per component, and a `manifest.json` — at build time and via `arvia gen --css`. `"single"` keeps the previous one-string-per-file behaviour.

  - **Compiler:** `CompileResult.cssParts` exposes the global / per-component / utility split (`combineCssParts` re-joins it to the existing `css`, byte-for-byte). New `buildCssBundle` / `buildCssManifest` / `splitTopLevelBlocks` aggregate a whole project, deduplicate shared global blocks, and promote keyframes shared by more than one component into `global.css`. `css.layers` wraps the output in cascade layers.
  - **Vite plugin:** `css.output`, `css.dir`, `css.layers`, `css.importStrategy`, and `css.libraryMode` options; structured output is written in `buildEnd`, stale files are swept, and the manifest is importable via `virtual:arvia/css-manifest`. The app bundling path and HMR are unchanged.
  - **New `@arviahq/runtime` package:** `collectArviaCss`, `ArviaCssCollector`, and `arviaCssLinks` resolve the manifest to the stylesheets a render actually used, for SSR and custom bundler integrations. `@arviahq/runtime/client` types the virtual manifest module.

  The default flips to component output, but existing apps need no change: bundled CSS is byte-identical and HMR behaves as before.

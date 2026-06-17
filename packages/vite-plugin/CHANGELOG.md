# @arviahq/vite-plugin

## 2.1.0

### Minor Changes

- c59a3f2: Add per-component CSS output, a CSS manifest, SSR collection, and library mode

  Arvia can now emit a structured CSS tree in addition to the per-file CSS that the bundler merges for apps. A new `css.output` mode (`"component"`, the default) writes a deduplicated shared `global.css`, one `components/<Name>.css` per component, and a `manifest.json` — at build time and via `arvia gen --css`. `"single"` keeps the previous one-string-per-file behaviour.

  - **Compiler:** `CompileResult.cssParts` exposes the global / per-component / utility split (`combineCssParts` re-joins it to the existing `css`, byte-for-byte). New `buildCssBundle` / `buildCssManifest` / `splitTopLevelBlocks` aggregate a whole project, deduplicate shared global blocks, and promote keyframes shared by more than one component into `global.css`. `css.layers` wraps the output in cascade layers.
  - **Vite plugin:** `css.output`, `css.dir`, `css.layers`, `css.importStrategy`, and `css.libraryMode` options; structured output is written in `buildEnd`, stale files are swept, and the manifest is importable via `virtual:arvia/css-manifest`. The app bundling path and HMR are unchanged.
  - **New `@arviahq/runtime` package:** `collectArviaCss`, `ArviaCssCollector`, and `arviaCssLinks` resolve the manifest to the stylesheets a render actually used, for SSR and custom bundler integrations. `@arviahq/runtime/client` types the virtual manifest module.

  The default flips to component output, but existing apps need no change: bundled CSS is byte-identical and HMR behaves as before.

### Patch Changes

- Updated dependencies [c59a3f2]
  - @arviahq/compiler@2.1.0
  - @arviahq/docs@2.1.0
  - @arviahq/storybook@2.1.0

## 2.0.1

### Patch Changes

- 8501b91: Stop warning when emitting sibling `.d.ts` for `.arv` files outside the source root

  Consuming a workspace/published Arvia library compiles its `.arv` across a package boundary, so each file falls outside the central dts `sourceRoot` and gets a sibling `.d.ts` instead. The plugin used to log a `[arvia] … is outside the dts sourceRoot` warning per file, which flooded consumers' build output. The sibling fallback (so the types still resolve) is unchanged — only the per-file warning is removed, since those declarations belong to the dependency, not the consuming build.
  - @arviahq/compiler@2.0.1
  - @arviahq/docs@2.0.1
  - @arviahq/storybook@2.0.1

## 2.0.0

### Patch Changes

- Updated dependencies [43731b8]
- Updated dependencies [7291b82]
  - @arviahq/compiler@2.0.0
  - @arviahq/docs@2.0.0
  - @arviahq/storybook@2.0.0

## 1.0.0

### Patch Changes

- Updated dependencies [71a471b]
  - @arviahq/compiler@1.0.0
  - @arviahq/docs@1.0.0
  - @arviahq/storybook@1.0.0

## 0.7.0

### Patch Changes

- Updated dependencies [b6876fb]
  - @arviahq/compiler@0.7.0
  - @arviahq/docs@0.7.0
  - @arviahq/storybook@0.7.0

## 0.6.1

### Patch Changes

- fb38c22: Production builds now emit short, identifier-safe hashed class names (e.g. `.k3j9f1a2`) instead of the long readable form. Development builds keep the readable `Component_variant_value_slot_hash` names for debugging. The Vite plugin selects the mode automatically from `command === "build"`. Hashes are derived from the file path and structure (never style content), so the CSS-only HMR and determinism guarantees are unchanged, and `.d.ts` output is unaffected.
- Updated dependencies [ca59363]
- Updated dependencies [fb38c22]
  - @arviahq/compiler@0.6.1
  - @arviahq/docs@0.6.1
  - @arviahq/storybook@0.6.1

## 0.6.0

### Minor Changes

- 15ca346: Emit `.d.ts` files by default so consumers can typecheck `.arv` imports with plain `tsc` — no `arvia-tsc`, no tsserver plugin.

  `dts` now defaults to `"central"`: declarations are mirrored into `.arvia/types` (e.g. `src/components/stack.arv` → `.arvia/types/components/stack.arv.d.ts`), updated on save and at build with stale mirrors pruned. The plugin drops a self-ignoring `.gitignore` into that folder, so generated files are never committed and no root `.gitignore` change is needed. Consumers add `"rootDirs": ["src", ".arvia/types"]` to their tsconfig (with `moduleResolution: "bundler"`) and run plain `tsc --noEmit`; `arvia gen` (now also central by default) materializes the tree in CI.

  Set `dts: false` to opt out and keep the file-less `@arviahq/typescript-plugin` path, or `dts: true` / `"sibling"` to write `foo.arv.d.ts` next to each source file.

### Patch Changes

- @arviahq/compiler@0.6.0
- @arviahq/docs@0.6.0
- @arviahq/storybook@0.6.0

## 0.5.1

### Patch Changes

- b17ffdb: Update repository metadata for the GitHub org transfer to [arviahq/arvia](https://github.com/arviahq/arvia).
- Updated dependencies [b17ffdb]
  - @arviahq/compiler@0.5.1
  - @arviahq/docs@0.5.1
  - @arviahq/storybook@0.5.1

## 0.5.0

### Patch Changes

- Updated dependencies [548b081]
  - @arviahq/compiler@0.5.0
  - @arviahq/docs@0.5.0
  - @arviahq/storybook@0.5.0

## 0.4.0

### Patch Changes

- Updated dependencies [446dd84]
  - @arviahq/compiler@0.4.0
  - @arviahq/docs@0.4.0
  - @arviahq/storybook@0.4.0

## 0.3.0

### Patch Changes

- @arviahq/compiler@0.3.0
- @arviahq/docs@0.3.0
- @arviahq/storybook@0.3.0

## 0.2.0

### Minor Changes

- cd2d964: First public release under the `@arviahq` scope.
  - Design system compiler for `.arv` files (tokens, recipes, components, styles)
  - Vite plugin with HMR and `arvia` CLI
  - TypeScript virtual types via `@arviahq/typescript-plugin`
  - Language Server for editor diagnostics, completion, hover, rename, and more
  - VS Code extension (`arviahq.arvia`)

### Patch Changes

- Updated dependencies [cd2d964]
  - @arviahq/compiler@0.2.0
  - @arviahq/docs@0.2.0
  - @arviahq/storybook@0.2.0

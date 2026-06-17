import fs from "node:fs";
import path from "node:path";
import { glob } from "tinyglobby";
import { normalizePath, type Logger, type Plugin, type ViteDevServer } from "vite";
import {
  compile,
  renderDiagnostic,
  type CompileResult,
  type CssOutputMode,
  type CssParts,
  type CssSourceMap,
  type Diagnostic,
  type FileCss,
  type ThemeEnv,
} from "@arviahq/compiler";
import { planCssOutput, writeCssOutput } from "./css-writer.js";
import { mirrorPathFor } from "./dts-paths.js";
import {
  ensureCentralGitignore,
  removeDts,
  scheduleDtsWrite,
  sweepDtsDir,
  writeDtsNow,
} from "./dts-writer.js";

/** Where generated `.d.ts` files go. See {@link ArviaOptions.dts}. */
export type DtsMode = "sibling" | "central";

export interface DtsConfig {
  /**
   * `'sibling'` writes `foo.arv.d.ts` next to each source file (resolved by
   * plain `tsc` with no config). `'central'` (default) mirrors them into a
   * single directory the consumer can `.gitignore`. Default: `'central'`.
   */
  mode?: DtsMode;
  /** Central directory, relative to the Vite root. Default: `.arvia/types`. */
  dir?: string;
  /**
   * Source root the central tree mirrors, relative to the Vite root. Must match
   * the first entry of `rootDirs` in the consumer's tsconfig. Default: `src`.
   */
  sourceRoot?: string;
}

/** CSS output configuration. See {@link CssConfig.output}. */
export interface CssConfig {
  /**
   * How CSS is partitioned across outputs.
   *
   * - `'component'` (default) — global/shared CSS and per-component CSS are
   *   tracked as separate buckets (enables library publishing, manual import
   *   control, per-component caching and manifest-driven SSR in later phases).
   * - `'single'` — one combined CSS string per file; simplest for static sites
   *   and older bundlers.
   * - `'chunk'` — reserved for a future grouping mode; not yet implemented.
   *
   * Note: the dev/app bundling path is identical for `'single'` and
   * `'component'` — Vite still bundles the per-file CSS into one asset. The
   * mode governs the structured disk emission (`global.css` +
   * `components/*.css` + `manifest.json`) produced at build time and by the
   * `arvia gen --css` CLI, which `'single'` skips.
   */
  output?: CssOutputMode;
  /**
   * Directory for the structured CSS output (component mode), relative to the
   * Vite root. Default: `.arvia/css`. A self-ignoring `.gitignore` is dropped
   * in so the generated tree is never committed.
   */
  dir?: string;
  /**
   * Wrap the structured output in cascade layers (`@layer arvia.tokens,
   * arvia.reset, arvia.base, arvia.components, arvia.utilities`) so import order
   * can never change the result. Off by default — enabling it alters cascade
   * resolution. Does not affect the bundled app CSS.
   */
  layers?: boolean;
  /**
   * How a compiled `.arv` module pulls in its CSS.
   *
   * - `'side-effect'` (default for apps) — the generated JS auto-imports its
   *   phantom CSS module, so styles load just by importing the component.
   * - `'manual'` / `'manifest'` — no auto-import; the consumer brings the CSS
   *   in itself (via the structured files, the manifest, or SSR collection).
   *   Required when publishing a library whose JS must not hard-depend on a
   *   bundler-specific CSS import.
   *
   * Defaults to `'manual'` when {@link CssConfig.libraryMode} is on, else
   * `'side-effect'`.
   */
  importStrategy?: "side-effect" | "manual" | "manifest";
  /**
   * Library/publishing mode. Flips the default import strategy to `'manual'`
   * so the emitted JS carries no automatic CSS side-effect import — consumers
   * import the published `global.css` / `components/*.css` (or use the manifest)
   * themselves. Pair with `arvia gen --css` to emit the publishable tree.
   */
  libraryMode?: boolean;
}

type ImportStrategy = "side-effect" | "manual" | "manifest";

export interface ArviaOptions {
  /**
   * Path (relative to the Vite root) of the shared theme file whose tokens
   * and recipes are available to every `.arv` file.
   * Defaults to `src/theme.arv` when that file exists.
   */
  theme?: string;
  /** CSS output configuration. Defaults to `{ output: 'component' }`. */
  css?: CssConfig;
  /**
   * Emit `.d.ts` files so plain `tsc` (no `arvia-tsc`, no tsserver plugin) can
   * typecheck `.arv` imports.
   *
   * - `'central'` (default, also when omitted) — mirror declarations into
   *   `.arvia/types` (a self-ignoring, generated directory). Requires
   *   `"rootDirs": ["src", ".arvia/types"]` in the consumer's tsconfig.
   * - `true` / `'sibling'` — write `foo.arv.d.ts` next to each source file.
   * - `false` — no files; types come from `@arviahq/typescript-plugin` instead.
   * - object — `'central'` with custom `dir` / `sourceRoot`.
   */
  dts?: boolean | DtsMode | DtsConfig;
}

interface ResolvedDts {
  mode: DtsMode;
  /** Absolute central directory (central mode only). */
  centralDir: string;
  /** Absolute source root (central mode only). */
  sourceRoot: string;
}

/** Normalizes the `dts` option into a resolved config, or `null` when off. */
function resolveDts(dts: ArviaOptions["dts"], root: string): ResolvedDts | null {
  // `false` is the only opt-out; everything else (including `undefined`) emits.
  if (dts === false) return null;
  if (dts === true || dts === "sibling") {
    return { mode: "sibling", centralDir: "", sourceRoot: "" };
  }
  // `undefined` / `'central'` / object → central, the default.
  const config: DtsConfig = dts === undefined || dts === "central" ? {} : dts;
  if ((config.mode ?? "central") === "sibling") {
    return { mode: "sibling", centralDir: "", sourceRoot: "" };
  }
  return {
    mode: "central",
    centralDir: normalizePath(path.resolve(root, config.dir ?? ".arvia/types")),
    sourceRoot: normalizePath(path.resolve(root, config.sourceRoot ?? "src")),
  };
}

const ARV_RE = /.arv$/;
const ARV_CSS_RE = /\.arv\.css$/;

/** Importable manifest of the structured CSS output, for SSR / preloading /
 *  tooling. Resolves to a module whose default export is a {@link CssManifest}. */
const VIRTUAL_MANIFEST_ID = "virtual:arvia/css-manifest";
const RESOLVED_MANIFEST_ID = `\0${VIRTUAL_MANIFEST_ID}`;

/** Validates and defaults the CSS output mode. `'chunk'` is reserved. */
function resolveCssOutput(css: ArviaOptions["css"]): CssOutputMode {
  const output = css?.output ?? "component";
  if (output !== "single" && output !== "component") {
    throw new Error(
      `[arvia] css.output: "${output}" is not supported — use "single" or "component".`,
    );
  }
  return output;
}

const firstError = (diagnostics: Diagnostic[]) => diagnostics.find((d) => d.severity === "error");

export function arvia(options: ArviaOptions = {}): Plugin {
  let root = process.cwd();
  let isBuild = false;
  let cssOutput: CssOutputMode = "component";
  let cssDir = ".arvia/css";
  let cssLayers = false;
  let importStrategy: ImportStrategy = "side-effect";
  /** Memoized `virtual:arvia/css-manifest` module body; invalidated on any
   *  `.arv` change so the manifest tracks added/removed components. */
  let manifestModule: string | null = null;
  let dts: ResolvedDts | null = null;
  let logger: Logger | undefined;
  let hintedRootDirs = false;
  let wroteGitignore = false;
  let themePath: string | null = null;
  let explicitThemePath: string | null = null;
  let conventionalThemePath = "";
  let themeEnv: ThemeEnv | undefined;
  /** Compiled CSS per .arv file, served through the phantom `<file>.arv.css`
   *  module. `parts` feeds the structured component-mode output at build time. */
  const cssCache = new Map<
    string,
    { css: string; map: CssSourceMap | null; parts: CssParts | null }
  >();
  /** Last generated JS per .arv file, used to detect style-only edits in HMR. */
  const jsCache = new Map<string, string>();
  /** Component name → defining files, to warn about cross-file name clashes. */
  const componentOwners = new Map<string, Set<string>>();
  const fileComponents = new Map<string, string[]>();
  const warnedCollisions = new Set<string>();

  /** Records a file's component names and reports names defined in more than
   *  one file — importing both into one module forces aliasing, and it is
   *  usually an accidental copy-paste. */
  const trackComponents = (id: string, names: string[], warn: (message: string) => void) => {
    for (const name of fileComponents.get(id) ?? []) {
      componentOwners.get(name)?.delete(id);
    }
    fileComponents.set(id, names);
    for (const name of names) {
      const owners = componentOwners.get(name) ?? new Set<string>();
      owners.add(id);
      componentOwners.set(name, owners);
      if (owners.size > 1) {
        const files = [...owners].map((f) => path.relative(root, f)).toSorted();
        const key = `${name}:${files.join(",")}`;
        if (warnedCollisions.has(key)) continue;
        warnedCollisions.add(key);
        warn(
          `'${name}' is defined in multiple files: ${files.join(", ")} — ` +
            `importing both into one module will require aliasing`,
        );
      }
    }
  };

  const untrackComponents = (id: string) => {
    for (const name of fileComponents.get(id) ?? []) {
      componentOwners.get(name)?.delete(id);
    }
    fileComponents.delete(id);
  };

  const loadThemeEnv = (): ThemeEnv | undefined => {
    if (!themePath) return undefined;
    if (themeEnv) return themeEnv;
    if (!fs.existsSync(themePath)) return undefined;
    const source = fs.readFileSync(themePath, "utf8");
    const result = compile(source, {
      filename: themePath,
      root,
      sharedEnvFile: true,
      minify: isBuild,
      cssOutput,
    });
    const error = firstError(result.diagnostics);
    if (error) throw new Error(renderDiagnostic(error));
    themeEnv = result.env;
    return themeEnv;
  };

  const compileFile = (id: string, code: string): CompileResult => {
    const isTheme = id === themePath;
    const env = isTheme ? undefined : loadThemeEnv();
    const result = compile(code, {
      filename: id,
      root,
      env,
      sharedEnvFile: isTheme,
      minify: isBuild,
      cssOutput,
    });
    if (isTheme && !firstError(result.diagnostics)) {
      themeEnv = result.env;
    }
    return result;
  };

  /** Compiles every `.arv` file in the project (theme first) into the parts the
   *  whole-project CSS aggregation needs, reusing cached parts where possible. */
  const collectProjectFileCss = async (): Promise<FileCss[]> => {
    const files = (
      await glob("**/*.arv", { cwd: root, absolute: true, ignore: ["**/node_modules/**"] })
    )
      .map(normalizePath)
      .toSorted((a, b) => (a === themePath ? -1 : b === themePath ? 1 : a < b ? -1 : 1));
    const out: FileCss[] = [];
    for (const file of files) {
      let parts = cssCache.get(file)?.parts ?? null;
      if (!parts) {
        try {
          const result = compileFile(file, fs.readFileSync(file, "utf8"));
          if (firstError(result.diagnostics)) continue;
          parts = result.cssParts;
        } catch {
          continue;
        }
      }
      if (parts) out.push({ parts });
    }
    return out;
  };

  /** Declaration path for a `.arv` id, or `null` when dts emission is off. */
  const dtsPathFor = (id: string): string | null => {
    if (!dts) return null;
    if (dts.mode === "sibling") return `${id}.d.ts`;
    const mirror = mirrorPathFor({
      arvAbsPath: id,
      sourceRoot: dts.sourceRoot,
      centralDir: dts.centralDir,
    });
    // Files outside the source root have no sensible mirror (typically a
    // workspace/published lib whose `.arv` is consumed across a package
    // boundary): fall back to a sibling so their types still resolve. We stay
    // quiet — the dependency owns those declarations, not this build.
    if (mirror === null) return `${id}.d.ts`;
    return mirror;
  };

  /** Writes a declaration, dropping the central `.gitignore` on first use. */
  const emitDts = (target: string, content: string, immediate: boolean) => {
    if (dts?.mode === "central" && !wroteGitignore) {
      wroteGitignore = true;
      ensureCentralGitignore(dts.centralDir);
    }
    if (immediate) writeDtsNow(target, content);
    else scheduleDtsWrite(target, content);
  };

  /** One-time nudge: central mode is inert until the consumer adds `rootDirs`. */
  const hintRootDirs = () => {
    if (hintedRootDirs || dts?.mode !== "central") return;
    hintedRootDirs = true;
    try {
      const tsconfig = fs.readFileSync(path.join(root, "tsconfig.json"), "utf8");
      // Already set up, or relying on the tsserver plugin for types: stay quiet.
      if (tsconfig.includes("rootDirs") || tsconfig.includes("@arviahq/typescript-plugin")) return;
    } catch {
      // No tsconfig (or unreadable): hint anyway.
    }
    const dir = path.relative(root, dts.centralDir);
    const src = path.relative(root, dts.sourceRoot);
    logger?.warn(
      `[arvia] writing .d.ts to ${dir}/ — add "rootDirs": ["${src}", "${dir}"] to your ` +
        `tsconfig so tsc resolves .arv imports (or set dts: false to use the TS plugin).`,
    );
  };

  return {
    name: "arvia",
    enforce: "pre",

    configResolved(config) {
      root = config.root;
      isBuild = config.command === "build";
      logger = config.logger;
      cssOutput = resolveCssOutput(options.css);
      cssDir = normalizePath(path.resolve(root, options.css?.dir ?? ".arvia/css"));
      cssLayers = options.css?.layers ?? false;
      importStrategy =
        options.css?.importStrategy ?? (options.css?.libraryMode ? "manual" : "side-effect");
      dts = resolveDts(options.dts, root);
      explicitThemePath = options.theme ? normalizePath(path.resolve(root, options.theme)) : null;
      conventionalThemePath = normalizePath(path.resolve(root, "src/theme.arv"));
      themePath =
        explicitThemePath ?? (fs.existsSync(conventionalThemePath) ? conventionalThemePath : null);
      hintRootDirs();
    },

    buildStart() {
      themeEnv = undefined;
      cssCache.clear();
      jsCache.clear();
      componentOwners.clear();
      fileComponents.clear();
      warnedCollisions.clear();
      wroteGitignore = false;
      manifestModule = null;
    },

    async buildEnd() {
      if (!isBuild) return;
      const needCss = cssOutput === "component";
      const needDtsSweep = dts?.mode === "central";
      if (!needCss && !needDtsSweep) return;

      // The whole-project view: every `.arv` file, not just the ones imported
      // by the bundle, so a published component library emits a complete CSS
      // tree and the dts sweep sees the full source set.
      const files = (
        await glob("**/*.arv", { cwd: root, absolute: true, ignore: ["**/node_modules/**"] })
      ).map(normalizePath);

      if (needDtsSweep) {
        const keep = new Set<string>();
        for (const file of files) {
          const target = dtsPathFor(file);
          if (target) keep.add(path.resolve(target));
        }
        sweepDtsDir(dts!.centralDir, keep);
      }

      if (needCss) {
        writeCssOutput(cssDir, await collectProjectFileCss(), { layers: cssLayers });
      }
    },

    configureServer(server: ViteDevServer) {
      const resetAll = () => {
        themeEnv = undefined;
        cssCache.clear();
        jsCache.clear();
        manifestModule = null;
        server.moduleGraph.invalidateAll();
        server.ws.send({ type: "full-reload" });
      };

      // Drops the memoized manifest and invalidates the virtual module so a
      // re-import recomputes it (components added/removed during the session).
      const invalidateManifest = () => {
        manifestModule = null;
        const mod = server.moduleGraph.getModuleById(RESOLVED_MANIFEST_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
      };

      // `handleHotUpdate` only sees edits to files already in the module
      // graph; brand-new and deleted .arv files arrive through the watcher.
      server.watcher.on("add", (rawFile) => {
        const file = normalizePath(rawFile);
        if (!ARV_RE.test(file)) return;

        // A theme file created mid-session (explicitly configured or the
        // conventional src/theme.arv): activate it and recompile the world.
        if (file === themePath || (!themePath && file === conventionalThemePath)) {
          themePath = file;
          resetAll();
          return;
        }

        // In dts mode, generate types as soon as the file exists so editors
        // resolve the import before anything loads the module.
        if (dts) {
          try {
            const result = compileFile(file, fs.readFileSync(file, "utf8"));
            if (!firstError(result.diagnostics)) {
              cssCache.set(file, { css: result.css!, map: result.cssMap, parts: result.cssParts });
              jsCache.set(file, result.js!);
              const target = dtsPathFor(file);
              if (target) emitDts(target, result.dts!, false);
            }
          } catch {
            // Unreadable or theme broken — transform surfaces it on import.
          }
        }
        invalidateManifest();
      });

      server.watcher.on("unlink", (rawFile) => {
        const file = normalizePath(rawFile);
        if (!ARV_RE.test(file)) return;
        cssCache.delete(file);
        jsCache.delete(file);
        untrackComponents(file);
        invalidateManifest();

        // Drop the generated declaration so stale types don't shadow anything
        // (and don't outlive their source).
        if (dts) {
          const target = dtsPathFor(file);
          if (target) removeDts(target, dts.mode === "central" ? dts.centralDir : undefined);
        }

        if (file === themePath) {
          // An explicitly-configured theme stays configured (it may come
          // back); a deleted conventional theme deactivates.
          if (!explicitThemePath) themePath = null;
          resetAll();
        }
      });
    },

    resolveId(source, importer) {
      if (source === VIRTUAL_MANIFEST_ID) return RESOLVED_MANIFEST_ID;
      if (!ARV_CSS_RE.test(source)) return;
      // Mark the phantom CSS id as resolved so Vite's CSS pipeline owns it
      // (dev injection, build extraction/minification) without touching disk.
      if (path.isAbsolute(source)) {
        // Direct browser requests arrive as root-relative URLs; map them onto
        // the project root when no file exists at the literal path.
        if (!fs.existsSync(source.slice(0, -".css".length))) {
          const rooted = path.join(root, source);
          if (fs.existsSync(rooted.slice(0, -".css".length))) return normalizePath(rooted);
        }
        return source;
      }
      if (importer) return path.resolve(path.dirname(importer), source);
      return source;
    },

    async load(id) {
      if (id === RESOLVED_MANIFEST_ID) {
        if (manifestModule === null) {
          const { manifest } = planCssOutput(await collectProjectFileCss(), { layers: cssLayers });
          manifestModule = `export default ${JSON.stringify(manifest)};\n`;
        }
        return manifestModule;
      }
      if (!ARV_CSS_RE.test(id)) return;
      const arviaPath = id.slice(0, -".css".length);
      const cached = cssCache.get(arviaPath);
      if (cached !== undefined) return { code: cached.css, map: cached.map };
      // Cache miss (server restart ordering, programmatic builds): compile from disk.
      const code = fs.readFileSync(arviaPath, "utf8");
      const result = compileFile(arviaPath, code);
      const error = firstError(result.diagnostics);
      if (error) this.error(renderDiagnostic(error));
      cssCache.set(arviaPath, { css: result.css!, map: result.cssMap, parts: result.cssParts });
      return { code: result.css!, map: result.cssMap };
    },

    transform(code, id) {
      if (!ARV_RE.test(id)) return;
      const result = compileFile(id, code);

      const error = firstError(result.diagnostics);
      if (error) {
        this.error({
          message: `${error.code}: ${error.message}${error.hint ? ` (hint: ${error.hint})` : ""}`,
          loc: { file: error.file, line: error.line, column: error.col },
        });
      }
      for (const warning of result.diagnostics) {
        if (warning.severity === "warning") this.warn(renderDiagnostic(warning));
      }

      cssCache.set(id, { css: result.css!, map: result.cssMap, parts: result.cssParts });
      jsCache.set(id, result.js!);
      trackComponents(
        id,
        // Styles share the export namespace, so they collide in imports too.
        [...result.meta.components.map((c) => c.name), ...result.meta.styles.map((s) => s.name)],
        (message) => this.warn(message),
      );
      const dtsPath = dtsPathFor(id);
      if (dtsPath) emitDts(dtsPath, result.dts!, isBuild);

      // 'side-effect' routes the generated CSS through Vite's pipeline by
      // appending an import. 'manual'/'manifest' (library mode) emit no
      // auto-import — the consumer brings the CSS in itself.
      const js =
        importStrategy === "side-effect"
          ? `import ${JSON.stringify(`${id}.css`)};\n${result.js!}`
          : result.js!;
      // The generated module is a handful of readable lines; mapping it back
      // to the .arv source would obscure more than it reveals.
      return { code: js, map: null };
    },

    handleHotUpdate(ctx) {
      if (!ARV_RE.test(ctx.file)) return;
      // The edit may change a component's class names or its parts — recompute
      // the manifest on next import.
      manifestModule = null;

      // Token/recipe edits can change every file's output: reset and reload.
      if (ctx.file === themePath) {
        themeEnv = undefined;
        cssCache.clear();
        jsCache.clear();
        ctx.server.moduleGraph.invalidateAll();
        ctx.server.ws.send({ type: "full-reload" });
        return [];
      }

      const cssModule = ctx.server.moduleGraph.getModuleById(`${ctx.file}.css`);
      const jsModules = [...(ctx.server.moduleGraph.getModulesByFile(ctx.file) ?? [])];

      let result: CompileResult | undefined;
      try {
        result = compileFile(ctx.file, fs.readFileSync(ctx.file, "utf8"));
      } catch {
        // Theme failed to compile: let transform surface the error overlay.
      }

      if (result && !firstError(result.diagnostics)) {
        cssCache.set(ctx.file, { css: result.css!, map: result.cssMap, parts: result.cssParts });
        const dtsPath = dtsPathFor(ctx.file);
        if (dtsPath) emitDts(dtsPath, result.dts!, false);

        // Style-only edit: class names are path-hashed, so the JS is
        // byte-identical — swap the CSS in place and leave the JS alone.
        if (result.js === jsCache.get(ctx.file) && cssModule) {
          return [cssModule];
        }
        jsCache.set(ctx.file, result.js!);
      } else {
        cssCache.delete(ctx.file);
      }

      return cssModule ? [...jsModules, cssModule] : jsModules;
    },
  };
}

export default arvia;

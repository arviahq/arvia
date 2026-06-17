import fs from "node:fs";
import path from "node:path";
import {
  buildCssBundle,
  buildCssManifest,
  type CssBundle,
  type CssManifest,
  type FileCss,
} from "@arviahq/compiler";

export interface WriteCssOptions {
  /** Wrap the output in cascade layers. */
  layers?: boolean;
}

/**
 * Aggregates the project's per-file parts and derives the output layout — the
 * bundle plus the manifest mapping each artifact to its relative path — without
 * touching disk. Shared by {@link writeCssOutput} and the `virtual:arvia/css-manifest`
 * module so both agree on paths.
 */
export function planCssOutput(
  files: FileCss[],
  options: WriteCssOptions = {},
): { bundle: CssBundle; manifest: CssManifest } {
  const bundle = buildCssBundle(files, { layers: options.layers });
  const components: Record<string, string> = {};
  for (const c of bundle.components) {
    if (c.css) components[c.name] = `components/${c.name}.css`;
  }
  return { bundle, manifest: buildCssManifest("global.css", components) };
}

export interface CssOutputResult {
  manifest: CssManifest;
  /** Absolute paths of every file written or kept (the live set). */
  written: Set<string>;
}

function writeIfChanged(file: string, content: string): void {
  let previous: string | undefined;
  try {
    previous = fs.readFileSync(file, "utf8");
  } catch {
    previous = undefined;
  }
  if (previous === content) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Drops a self-ignoring `.gitignore` so generated CSS is never committed. */
function ensureGitignore(dir: string): void {
  const file = path.join(dir, ".gitignore");
  try {
    if (fs.existsSync(file)) return;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, "*\n!.gitignore\n");
  } catch {
    // Best-effort hygiene, not a build failure.
  }
}

/** Removes generated CSS / manifest files under `dir` not in `keep` (stale
 *  components from a prior run), and prunes the now-empty `components/` dir. */
function sweep(dir: string, keep: Set<string>): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name === ".gitignore") continue;
    if (!entry.name.endsWith(".css") && entry.name !== "manifest.json") continue;
    const full = path.resolve(entry.parentPath, entry.name);
    if (!keep.has(full)) fs.rmSync(full, { force: true });
  }
  const componentsDir = path.join(dir, "components");
  try {
    if (fs.readdirSync(componentsDir).length === 0) fs.rmdirSync(componentsDir);
  } catch {
    // Non-empty or absent — leave it.
  }
}

/**
 * Aggregates the project's per-file CSS parts and writes the structured output
 * tree under `outDir`:
 *
 *     <outDir>/global.css
 *     <outDir>/components/<Name>.css
 *     <outDir>/manifest.json
 *     <outDir>/.gitignore
 *
 * Identical writes are skipped (HMR/editor friendliness) and stale files from a
 * prior run are swept. Returns the manifest and the live file set.
 */
export function writeCssOutput(
  outDir: string,
  files: FileCss[],
  options: WriteCssOptions = {},
): CssOutputResult {
  const { bundle, manifest } = planCssOutput(files, options);
  const written = new Set<string>();
  const write = (rel: string, content: string) => {
    const abs = path.resolve(outDir, rel);
    writeIfChanged(abs, content);
    written.add(abs);
  };

  write(manifest.global, bundle.global ? `${bundle.global}\n` : "");
  for (const c of bundle.components) {
    const rel = manifest.components[c.name];
    if (rel) write(rel, `${c.css}\n`);
  }
  write("manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);

  ensureGitignore(outDir);
  sweep(outDir, written);
  return { manifest, written };
}

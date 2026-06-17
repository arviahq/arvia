/**
 * Tiny, zero-dependency runtime helpers for Arvia's component CSS output.
 *
 * The build/CLI step emits a `manifest.json` mapping the shared `global.css`
 * and each component's stylesheet to a path. For SSR (or any custom bundler
 * integration) you load that manifest and, given the components a request
 * actually rendered, ask which stylesheets to send — so a page ships only the
 * CSS it uses, plus the shared global file.
 */

/** Shape of Arvia's generated `manifest.json`. Mirrors `CssManifest` from
 *  `@arviahq/compiler`; kept inline so this package has no dependencies. */
export interface CssManifest {
  /** Path to the shared global stylesheet, relative to the manifest. */
  global: string;
  /** Component name → stylesheet path, relative to the manifest. */
  components: Record<string, string>;
}

export interface CollectOptions {
  /** Prefix prepended to each manifest-relative path — e.g. a public base URL
   *  (`/assets/arvia`) or a published package path. Default: none. */
  base?: string;
  /** Include the shared `global.css` first. Default: `true`. */
  includeGlobal?: boolean;
}

function withBase(p: string, base?: string): string {
  if (!base) return p;
  return `${base.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
}

/**
 * Returns the stylesheet paths needed to render the given components: the
 * shared `global.css` first (unless disabled), then each named component's
 * stylesheet, in the order requested. Unknown names and duplicates are dropped,
 * so it is safe to pass a render's full (possibly repeated) component list.
 */
export function collectArviaCss(
  componentNames: Iterable<string>,
  manifest: CssManifest,
  options: CollectOptions = {},
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const add = (p: string) => {
    if (seen.has(p)) return;
    seen.add(p);
    out.push(withBase(p, options.base));
  };

  if (options.includeGlobal !== false && manifest.global) add(manifest.global);
  for (const name of componentNames) {
    const p = manifest.components[name];
    if (p) add(p);
  }
  return out;
}

/** Renders `<link rel="stylesheet">` tags for a list of stylesheet paths —
 *  a convenience for injecting collected CSS into an SSR document `<head>`. */
export function arviaCssLinks(paths: string[]): string {
  return paths.map((href) => `<link rel="stylesheet" href="${href}">`).join("");
}

/**
 * Accumulates the set of components used during a server render, then resolves
 * them against the manifest. Create one per request, mark components as they
 * render (`use`), and call `collect` when building the document head.
 */
export class ArviaCssCollector {
  private readonly used = new Set<string>();

  /** Marks one or more components as used by the current render. */
  use(...componentNames: string[]): void {
    for (const name of componentNames) this.used.add(name);
  }

  /** The components marked so far, in insertion order. */
  get components(): string[] {
    return [...this.used];
  }

  /** Resolves the used components to their stylesheet paths via the manifest. */
  collect(manifest: CssManifest, options?: CollectOptions): string[] {
    return collectArviaCss(this.used, manifest, options);
  }
}

/** The CSS manifest: the source of truth that maps a project's shared and
 *  per-component stylesheets to their on-disk locations. Emitted by the
 *  build/CLI step alongside `global.css` and the `components/*.css` files, and
 *  consumed by SSR helpers, preloading, and custom bundler integrations. Paths
 *  are relative to the manifest's own directory, so the output tree is portable. */
export interface CssManifest {
  /** Path to the shared global stylesheet, relative to the manifest. */
  global: string;
  /** Component name → path of its stylesheet, relative to the manifest. */
  components: Record<string, string>;
}

/** Builds a manifest from a component→path map and the global file's path. */
export function buildCssManifest(
  globalPath: string,
  components: Record<string, string>,
): CssManifest {
  // Sort component keys so the serialized manifest is deterministic across runs.
  const sorted: Record<string, string> = {};
  for (const name of Object.keys(components).toSorted()) sorted[name] = components[name]!;
  return { global: globalPath, components: sorted };
}

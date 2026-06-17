/**
 * Ambient types for Arvia's Vite virtual modules. Reference this from a
 * `.d.ts` (or any TS file) in your app so `import manifest from
 * "virtual:arvia/css-manifest"` is typed:
 *
 *     /// <reference types="@arviahq/runtime/client" />
 */

declare module "virtual:arvia/css-manifest" {
  import type { CssManifest } from "@arviahq/runtime";
  const manifest: CssManifest;
  export default manifest;
}

import { createRequire } from "node:module";
import { defineConfig } from "tsdown";

const require = createRequire(import.meta.url);

// The UMD build wraps its internal requires in a factory, which bundlers
// can't statically follow — point the bundle at the ESM build instead.
const cssLanguageServiceEsm = require.resolve(
  "vscode-css-languageservice/lib/esm/cssLanguageService.js",
  { paths: [new URL("../language-server", import.meta.url).pathname] },
);

// The vsix is packaged with --no-dependencies (vsce can't walk pnpm
// workspaces), so both bundles must be fully self-contained: only the
// vscode runtime API stays external.
export default defineConfig([
  {
    entry: ["src/extension.ts"],
    format: ["cjs"],
    dts: false,
    sourcemap: true,
    target: "es2022",
    external: ["vscode"],
    noExternal: [/.*/],
  },
  {
    entry: { server: "../language-server/src/server.ts" },
    format: ["cjs"],
    dts: false,
    sourcemap: true,
    target: "es2022",
    platform: "node",
    noExternal: [/.*/],
    alias: { "vscode-css-languageservice": cssLanguageServiceEsm },
  },
]);

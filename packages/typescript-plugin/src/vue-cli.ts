import { runTsc } from "@volar/typescript/lib/quickstart/runTsc";
import { createArviaLanguagePlugin } from "./languagePlugin";

/**
 * Vue-aware arvia-tsc (the bin shipped by @arviahq/vite-plugin-vue): mirrors
 * vue-tsc's `run()` with the Arvia language plugin added, so `.arv` imports
 * inside `.vue` single-file components typecheck — use it in place of vue-tsc.
 */

// Optional peer, provided by @arviahq/vite-plugin-vue (or installed directly).
let vue: typeof import("@vue/language-core");
try {
  vue = require("@vue/language-core");
} catch {
  console.error(
    "arvia-tsc (Vue mode) requires @vue/language-core.\n" +
      "Install @arviahq/vite-plugin-vue or add @vue/language-core to your devDependencies.",
  );
  process.exit(1);
}

const windowsPathReg = /\\/g;
const tscPath = require.resolve("typescript/lib/tsc");

// vue-tsc re-runs once when vueCompilerOptions declare extra SFC extensions
// (e.g. .mpx); replicate that, always keeping .arv in the list.
let runExtensions = [".vue", ".arv"];
let extensionsChangedException: Error | undefined;

const main = () =>
  runTsc(tscPath, runExtensions, (ts, options) => {
    const { configFilePath } = options.options;
    const vueOptions =
      typeof configFilePath === "string"
        ? vue.createParsedCommandLine(ts, ts.sys, configFilePath.replace(windowsPathReg, "/"))
            .vueOptions
        : vue.createParsedCommandLineByJson(
            ts,
            ts.sys,
            (options.host ?? ts.sys).getCurrentDirectory(),
            {},
          ).vueOptions;
    const allExtensions = [...vue.getAllExtensions(vueOptions), ".arv"];
    if (
      runExtensions.length === allExtensions.length &&
      runExtensions.every((ext) => allExtensions.includes(ext))
    ) {
      const vueLanguagePlugin = vue.createVueLanguagePlugin<string>(
        ts,
        options.options,
        vueOptions,
        (id) => id,
      );
      return { languagePlugins: [vueLanguagePlugin, createArviaLanguagePlugin(ts)] };
    }
    runExtensions = allExtensions;
    throw (extensionsChangedException = new Error("extensions changed"));
  });

try {
  main();
} catch (err) {
  if (err === extensionsChangedException) {
    main();
  } else {
    throw err;
  }
}

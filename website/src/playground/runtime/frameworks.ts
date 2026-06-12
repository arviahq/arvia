/** Framework registry for the live playground: CDN pins, import maps, mount code. */

export type FrameworkId = "react" | "preact" | "vue";

const CDN = "https://esm.sh";

const REACT_VERSION = "19.2.7";
const PREACT_VERSION = "10.29.2";
/** Must match the `@vue/compiler-sfc` version in package.json byte-for-byte:
 *  templates are precompiled in the worker, the CDN runtime executes them. */
export const VUE_VERSION = "3.5.38";

export interface FrameworkSpec {
  id: FrameworkId;
  /** Brand name — not translated. */
  label: string;
  appFileName: string;
  monacoLanguage: "typescript" | "html";
  /** Bare-specifier resolution for the preview iframe. `?external=` keeps a
   *  single copy of the core package across CDN subpath modules. */
  importMap: Record<string, string>;
  /** ESM bootstrap baked into the iframe srcdoc. Must define
   *  `globalThis.__mount(App)` with replace semantics (old app goes away). */
  mountScript: string;
}

export const FRAMEWORKS: Record<FrameworkId, FrameworkSpec> = {
  react: {
    id: "react",
    label: "React",
    appFileName: "App.tsx",
    monacoLanguage: "typescript",
    importMap: {
      react: `${CDN}/react@${REACT_VERSION}`,
      "react/jsx-runtime": `${CDN}/react@${REACT_VERSION}/jsx-runtime`,
      "react-dom/client": `${CDN}/react-dom@${REACT_VERSION}/client?external=react`,
    },
    mountScript: `import { createElement } from "react";
import { createRoot } from "react-dom/client";
const root = createRoot(document.getElementById("root"));
globalThis.__mount = (App) => root.render(createElement(App));`,
  },
  preact: {
    id: "preact",
    label: "Preact",
    appFileName: "App.tsx",
    monacoLanguage: "typescript",
    importMap: {
      preact: `${CDN}/preact@${PREACT_VERSION}`,
      "preact/hooks": `${CDN}/preact@${PREACT_VERSION}/hooks?external=preact`,
      "preact/jsx-runtime": `${CDN}/preact@${PREACT_VERSION}/jsx-runtime?external=preact`,
    },
    mountScript: `import { h, render } from "preact";
const el = document.getElementById("root");
globalThis.__mount = (App) => render(h(App, null), el);`,
  },
  vue: {
    id: "vue",
    label: "Vue",
    appFileName: "App.vue",
    monacoLanguage: "html",
    importMap: {
      vue: `${CDN}/vue@${VUE_VERSION}`,
    },
    mountScript: `import { createApp } from "vue";
const el = document.getElementById("root");
let app = null;
globalThis.__mount = (App) => {
  if (app) app.unmount();
  app = createApp(App);
  app.mount(el);
};`,
  },
};

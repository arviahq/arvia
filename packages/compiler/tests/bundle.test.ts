import { describe, expect, it } from "vitest";
import {
  ARVIA_LAYER_ORDER,
  buildCssBundle,
  buildCssManifest,
  splitTopLevelBlocks,
  type FileCss,
} from "../src/index.js";
import type { CssParts } from "../src/index.js";

const parts = (p: Partial<CssParts>): CssParts => ({
  global: "",
  components: [],
  styles: "",
  ...p,
});

const file = (p: Partial<CssParts>): FileCss => ({ parts: parts(p) });

describe("splitTopLevelBlocks", () => {
  it("splits rule sets, statements and nested blocks correctly", () => {
    const css = `@import "x.css";\n\n:root {\n  --a: 1;\n}\n\n@media (min-width: 1px) {\n  .a {\n    color: red;\n  }\n}`;
    expect(splitTopLevelBlocks(css)).toEqual([
      `@import "x.css";`,
      `:root {\n  --a: 1;\n}`,
      `@media (min-width: 1px) {\n  .a {\n    color: red;\n  }\n}`,
    ]);
  });

  it("keeps a multi-step keyframes block (with blank lines) intact", () => {
    const kf = `@keyframes spin {\n  from {\n    transform: rotate(0);\n  }\n\n  to {\n    transform: rotate(360deg);\n  }\n}`;
    expect(splitTopLevelBlocks(`${kf}\n\n.b {\n  color: red;\n}`)).toEqual([
      kf,
      `.b {\n  color: red;\n}`,
    ]);
  });
});

describe("buildCssBundle", () => {
  it("aggregates and deduplicates global blocks across files", () => {
    const reset = `* {\n  box-sizing: border-box;\n}`;
    const root = `:root {\n  --a: 1;\n}`;
    const bundle = buildCssBundle([
      file({ global: `${root}\n\n${reset}` }),
      file({ global: reset }), // duplicate reset from another file
    ]);
    expect(bundle.global).toBe(`${root}\n\n${reset}`);
  });

  it("places standalone styles (utilities) into the global bucket, last", () => {
    const bundle = buildCssBundle([
      file({ global: `:root {\n  --a: 1;\n}`, styles: `.sr {\n  position: absolute;\n}` }),
    ]);
    expect(bundle.global).toBe(`:root {\n  --a: 1;\n}\n\n.sr {\n  position: absolute;\n}`);
  });

  it("keeps per-component CSS keyed by name", () => {
    const bundle = buildCssBundle([
      file({ components: [{ name: "Button", css: `.Button_root_x {\n  color: red;\n}` }] }),
      file({ components: [{ name: "Card", css: `.Card_root_y {\n  color: blue;\n}` }] }),
    ]);
    expect(bundle.components).toEqual([
      { name: "Button", css: `.Button_root_x {\n  color: red;\n}` },
      { name: "Card", css: `.Card_root_y {\n  color: blue;\n}` },
    ]);
  });

  it("promotes a keyframe shared by >1 component into global, stripping it from each", () => {
    const kf = `@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}`;
    const bundle = buildCssBundle([
      file({ components: [{ name: "A", css: `.A {\n  color: red;\n}\n\n${kf}` }] }),
      file({ components: [{ name: "B", css: `${kf}\n\n.B {\n  color: blue;\n}` }] }),
    ]);
    expect(bundle.global).toContain(kf);
    expect(bundle.components[0]!.css).toBe(`.A {\n  color: red;\n}`);
    expect(bundle.components[1]!.css).toBe(`.B {\n  color: blue;\n}`);
  });

  it("does not promote a keyframe used by only one component", () => {
    const kf = `@keyframes spin {\n  to {\n    transform: rotate(360deg);\n  }\n}`;
    const bundle = buildCssBundle([
      file({ components: [{ name: "A", css: `.A {\n  color: red;\n}\n\n${kf}` }] }),
      file({ components: [{ name: "B", css: `.B {\n  color: blue;\n}` }] }),
    ]);
    expect(bundle.global).toBe("");
    expect(bundle.components[0]!.css).toContain(kf);
  });

  it("wraps buckets in cascade layers and prepends the order declaration when enabled", () => {
    const bundle = buildCssBundle(
      [
        file({
          global: `:root {\n  --a: 1;\n}`,
          styles: `.sr {\n  position: absolute;\n}`,
          components: [{ name: "Button", css: `.Button_root_x {\n  color: red;\n}` }],
        }),
      ],
      { layers: true },
    );
    expect(bundle.global.startsWith(ARVIA_LAYER_ORDER)).toBe(true);
    expect(bundle.global).toContain("@layer arvia.base {");
    expect(bundle.global).toContain("@layer arvia.utilities {");
    expect(bundle.components[0]!.css).toBe(
      `@layer arvia.components {\n.Button_root_x {\n  color: red;\n}\n}`,
    );
  });
});

describe("buildCssManifest", () => {
  it("sorts component keys for deterministic output", () => {
    const manifest = buildCssManifest("global.css", {
      Card: "components/Card.css",
      Button: "components/Button.css",
    });
    expect(manifest.global).toBe("global.css");
    expect(Object.keys(manifest.components)).toEqual(["Button", "Card"]);
  });
});

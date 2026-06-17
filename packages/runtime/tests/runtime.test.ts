import { describe, expect, it } from "vitest";
import {
  ArviaCssCollector,
  arviaCssLinks,
  collectArviaCss,
  type CssManifest,
} from "../src/index.js";

const manifest: CssManifest = {
  global: "global.css",
  components: {
    Button: "components/Button.css",
    Card: "components/Card.css",
  },
};

describe("collectArviaCss", () => {
  it("returns global first, then the requested components in order", () => {
    expect(collectArviaCss(["Card", "Button"], manifest)).toEqual([
      "global.css",
      "components/Card.css",
      "components/Button.css",
    ]);
  });

  it("drops unknown names and duplicates", () => {
    expect(collectArviaCss(["Button", "Nope", "Button"], manifest)).toEqual([
      "global.css",
      "components/Button.css",
    ]);
  });

  it("can omit the global file", () => {
    expect(collectArviaCss(["Button"], manifest, { includeGlobal: false })).toEqual([
      "components/Button.css",
    ]);
  });

  it("prefixes paths with base, normalizing slashes", () => {
    expect(collectArviaCss(["Button"], manifest, { base: "/assets/arvia/" })).toEqual([
      "/assets/arvia/global.css",
      "/assets/arvia/components/Button.css",
    ]);
  });
});

describe("arviaCssLinks", () => {
  it("renders link tags", () => {
    expect(arviaCssLinks(["global.css", "components/Button.css"])).toBe(
      '<link rel="stylesheet" href="global.css"><link rel="stylesheet" href="components/Button.css">',
    );
  });
});

describe("ArviaCssCollector", () => {
  it("tracks used components and resolves them via the manifest", () => {
    const collector = new ArviaCssCollector();
    collector.use("Button");
    collector.use("Card", "Button");
    expect(collector.components).toEqual(["Button", "Card"]);
    expect(collector.collect(manifest)).toEqual([
      "global.css",
      "components/Button.css",
      "components/Card.css",
    ]);
  });
});

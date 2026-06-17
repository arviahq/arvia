import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { combineCssParts } from "../src/generators/css/emit.js";
import { classify } from "../src/generators/css/partition.js";
import { compile } from "../src/index.js";
import type { AtRuleIR, ComponentIR, FileIR, StyleDeclIR } from "../src/ir/ir.js";

const fixturesDir = fileURLToPath(new URL("./fixtures", import.meta.url));
const fixtures = readdirSync(fixturesDir).filter((f) => f.endsWith(".arv"));

function atRule(name: string, statement?: boolean): AtRuleIR {
  return { name, prelude: `@${name} x`, decls: [], rules: [], atRules: [], statement };
}

function fileIR(partial: Partial<FileIR>): FileIR {
  return {
    globals: [],
    globalAtRules: [],
    components: [],
    styles: [],
    themeVars: [],
    themeModes: null,
    ...partial,
  };
}

describe("classify", () => {
  it("splits global at-rules into statement vs block, preserving order", () => {
    const imp = atRule("import", true);
    const media = atRule("media");
    const charset = atRule("charset", true);
    const graph = classify(fileIR({ globalAtRules: [imp, media, charset] }));
    expect(graph.global.statementAtRules).toEqual([imp, charset]);
    expect(graph.global.globalAtRules).toEqual([media]);
  });

  it("carries theme, globals, components and styles through by reference", () => {
    const themeVars = [{ group: "color", name: "primary", doc: null, byMode: { light: "#fff" } }];
    const globals = [{ selector: "html", decls: [{ property: "margin", value: "0" }] }];
    const components = [{ name: "A" }, { name: "B" }] as unknown as ComponentIR[];
    const styles = [{ name: "sr" }] as unknown as StyleDeclIR[];
    const ir = fileIR({ themeVars, themeModes: ["light"], globals, components, styles });
    const graph = classify(ir);

    expect(graph.global.themeVars).toBe(themeVars);
    expect(graph.global.themeModes).toEqual(["light"]);
    expect(graph.global.globals).toBe(globals);
    expect(graph.components.map((c) => c.component.name)).toEqual(["A", "B"]);
    expect(graph.styles).toBe(styles);
  });

  it("does not mutate or reorder the source IR", () => {
    const ir = fileIR({ globalAtRules: [atRule("import", true), atRule("media")] });
    const before = ir.globalAtRules.slice();
    classify(ir);
    expect(ir.globalAtRules).toEqual(before);
  });
});

describe("cssParts ↔ css invariant", () => {
  for (const file of fixtures) {
    it(`combineCssParts reproduces css for ${file}`, () => {
      const source = readFileSync(join(fixturesDir, file), "utf8");
      const result = compile(source, { filename: file });
      expect(result.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
      expect(result.cssParts).not.toBeNull();
      expect(combineCssParts(result.cssParts!)).toBe(result.css);
    });
  }

  it("is independent of output mode (single === component === default)", () => {
    const source = readFileSync(join(fixturesDir, "button.arv"), "utf8");
    const def = compile(source, { filename: "button.arv" });
    const single = compile(source, { filename: "button.arv", cssOutput: "single" });
    const component = compile(source, { filename: "button.arv", cssOutput: "component" });
    expect(single.css).toBe(def.css);
    expect(component.css).toBe(def.css);
  });

  it("buckets a component's rules under its name", () => {
    const source = readFileSync(join(fixturesDir, "button.arv"), "utf8");
    const { cssParts } = compile(source, { filename: "button.arv" });
    const button = cssParts!.components.find((c) => c.name === "Button");
    expect(button).toBeDefined();
    expect(button!.css).toContain("Button_root_");
    // Component CSS never carries the shared :root theme block.
    expect(button!.css).not.toContain(":root");
  });

  it("routes theme tokens into the global bucket", () => {
    const source = readFileSync(join(fixturesDir, "multi-theme.arv"), "utf8");
    const { cssParts } = compile(source, { filename: "multi-theme.arv" });
    expect(cssParts!.global).toContain(":root");
    expect(cssParts!.global).toContain("--arvia-");
  });
});

describe("cssOutput guard", () => {
  it('throws for the unimplemented "chunk" mode', () => {
    expect(() =>
      compile("component A { base { color: red; } }", { filename: "a.arv", cssOutput: "chunk" }),
    ).toThrow(/chunk/);
  });
});

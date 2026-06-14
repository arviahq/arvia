import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const css = (source: string) => {
  const result = compile(source, { filename: "at.arv" });
  expect(result.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
  return result.css!;
};

describe("raw at-rule pass-through", () => {
  it("emits a top-level @keyframes verbatim, with literal names (no hashing)", () => {
    const out = css(
      `@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`,
    );
    expect(out).toContain("@keyframes spin {");
    expect(out).toContain("from {");
    expect(out).toContain("transform: rotate(360deg);");
    expect(out).not.toMatch(/@keyframes spin_[a-z0-9]/);
  });

  it("does not rewrite token-shaped refs inside @keyframes (pure pass-through)", () => {
    const out = css(`theme { color { primary = #f00; } }
@keyframes glow { to { color: color.primary; } }`);
    // The keyframes body passes through untouched — the ref text is preserved.
    expect(out).toContain("color: color.primary;");
  });

  it("passes raw at-rules through a global block", () => {
    const out = css(`global {
  @media (min-width: 600px) {
    body { margin: 0; }
  }
}`);
    expect(out).toContain("@media (min-width: 600px) {");
    expect(out).toContain("body {");
    expect(out).toContain("margin: 0;");
  });

  it("nests @supports inside a component base, scoped to the slot class", () => {
    const out = css(`component Box {
  base {
    display: grid;
    @supports (display: grid) {
      gap: 8px;
    }
  }
}`);
    expect(out).toMatch(/@supports \(display: grid\) \{\n\.Box_root_[a-z0-9]+ \{\n {2}gap: 8px;/);
  });

  it("resolves token refs in non-keyframes at-rule declarations", () => {
    const out = css(`theme { space { md = 16px; } }
component Box {
  base {
    @media (min-width: 600px) {
      padding: space.md;
    }
  }
}`);
    expect(out).toContain("padding: 16px;");
  });
});

describe("statement at-rules (blockless, ;-terminated)", () => {
  it("emits @import / @charset verbatim, hoisted before the :root theme block", () => {
    const out = css(`theme { modes: light | dark; color { a = #fff; @dark { a = #000; } } }
@charset "utf-8";
@import "reset.css";
component A { base { color: color.a; } }`);
    expect(out).toContain('@charset "utf-8";');
    expect(out).toContain('@import "reset.css";');
    // hoisted: both precede the :root block
    expect(out.indexOf("@charset")).toBeLessThan(out.indexOf(":root"));
    expect(out.indexOf("@import")).toBeLessThan(out.indexOf(":root"));
  });

  it("emits the @layer ordering statement verbatim", () => {
    expect(css(`@layer reset, base, utilities;`).trim()).toBe("@layer reset, base, utilities;");
  });
});

describe("descriptor at-rules nested in a component emit verbatim (not class-scoped)", () => {
  it("does not wrap @font-face descriptors in the slot class", () => {
    const out = css(
      `component A { base { @font-face { font-family: "X"; src: url(x.woff2); } color: red; } }`,
    );
    expect(out).toContain('@font-face {\n  font-family: "X";');
    expect(out).not.toMatch(/@font-face \{\n\.A_root/);
  });

  // Every name in DESCRIPTOR_AT_RULES: a sibling declaration is class-scoped,
  // but the descriptor body stays bare even when authored inside a component.
  // (Names contain only letters/hyphens, safe to interpolate into a RegExp.)
  it.each([
    ["font-face", "", "font-family"],
    ["font-feature-values", `"X"`, "font-display"],
    ["font-palette-values", "--x", "font-family"],
    ["counter-style", "thumbs", "system"],
    ["property", "--x", "syntax"],
    ["page", "", "margin"],
    ["position-try", "--fallback", "top"],
    ["view-transition", "", "navigation"],
  ])("emits @%s verbatim, not wrapped in the slot class", (name, prelude, prop) => {
    const head = prelude ? `@${name} ${prelude}` : `@${name}`;
    const out = css(`component A { base { ${head} { ${prop}: foo; } color: red; } }`);
    // the sibling decl is still scoped to the slot class...
    expect(out).toMatch(/\.A_root_[a-z0-9]+ \{\n {2}color: red;/);
    // ...but the descriptor body emits bare — its property follows `{` directly,
    // with no class selector spliced in.
    expect(out).toMatch(new RegExp(`@${name}[^{]*\\{\\s*${prop}: foo;`));
    expect(out).not.toMatch(new RegExp(`@${name}[^{]*\\{\\s*\\.A_root`));
  });

  it("keeps a descriptor at-rule verbatim even nested under a conditional group", () => {
    const out = css(
      `component A { base { @supports (top: 0) { @position-try --f { top: 0; } color: red; } } }`,
    );
    // @supports wraps its element-style sibling in the class...
    expect(out).toMatch(/@supports \(top: 0\) \{\n\.A_root_[a-z0-9]+ \{\n {2}color: red;/);
    // ...while the inner descriptor stays bare.
    expect(out).toContain("@position-try --f {\n  top: 0;");
    expect(out).not.toMatch(/@position-try[^{]*\{\n\.A_root/);
  });
});

describe("Arvia constructs inside an at-rule (@layer base { component X {} })", () => {
  it("wraps the component's CSS in the at-rule chain and still exports it", () => {
    const r = compile(`@layer base { component Button { base { color: red; } } }`, {
      filename: "at.arv",
    });
    expect(r.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
    expect(r.css).toMatch(/@layer base \{\n\.Button_root_[a-z0-9]+ \{\n {2}color: red;/);
    expect(r.js).toContain("export function Button");
  });

  it("nests the wrapper chain (outer→inner) for @layer + @media", () => {
    const out = css(`theme { breakpoint { md = 768px; } }
@layer base { @media (min-width: breakpoint.md) { component Card { base { color: red; } } } }`);
    expect(out).toMatch(/@layer base \{\n@media \(min-width: 768px\) \{\n\.Card_root_/);
  });

  it("ARV129: a component declared inside another component is rejected", () => {
    const codes = compile(
      `component Outer { base { @layer x { component Inner { base { color: red; } } } } }`,
      { filename: "at.arv" },
    ).diagnostics.map((d) => d.code);
    expect(codes).toContain("ARV129");
  });
});

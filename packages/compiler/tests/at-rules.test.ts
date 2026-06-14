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

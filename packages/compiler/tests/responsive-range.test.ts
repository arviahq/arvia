import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const THEME = `theme {
  breakpoint { sm = 480px; md = 768px; lg = 1024px; }
  container-size { narrow = 320px; wide = 560px; }
}`;

/** Compiles a component body against the shared range theme above. */
const css = (body: string) => {
  const result = compile(`${THEME}\n${body}`, { filename: "range.arv" });
  expect(result.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
  return result.css!;
};

const codes = (source: string) =>
  compile(source, { filename: "range.arv" }).diagnostics.map((d) => d.code);

describe("@media / @container preludes inline token refs", () => {
  it("inlines a breakpoint ref to its literal value", () => {
    const out = css(`component B { base { @media (min-width: breakpoint.md) { color: red; } } }`);
    expect(out).toContain("@media (min-width: 768px)");
    expect(out).not.toContain("breakpoint.md");
  });

  it("inlines a container-size ref (measured in inline-size)", () => {
    const out = css(
      `component C { base { @container (inline-size < container-size.wide) { color: red; } } }`,
    );
    expect(out).toContain("@container (inline-size < 560px)");
  });

  it("inlines refs inside a multi-feature condition", () => {
    const out = css(
      `component B { base { @media (breakpoint.sm <= width < breakpoint.lg) { color: red; } } }`,
    );
    expect(out).toContain("@media (480px <= width < 1024px)");
  });

  it("scopes the bare declarations under the owning slot class", () => {
    const out = css(`component B { base { @media (min-width: breakpoint.md) { color: red; } } }`);
    expect(out).toMatch(/@media \(min-width: 768px\) \{\n\.B_root_[a-z0-9]+ \{\n {2}color: red;/);
  });

  it("leaves a plain (no-ref) condition verbatim", () => {
    const out = css(`component B { base { @media (min-width: 900px) { color: red; } } }`);
    expect(out).toContain("@media (min-width: 900px)");
  });

  it("leaves @media print / feature queries verbatim", () => {
    const out = css(`component B { base { @media (max-height: 500px) { color: red; } } }`);
    expect(out).toContain("@media (max-height: 500px)");
  });

  it("flags an unknown breakpoint ref with a did-you-mean fix", () => {
    const d = compile(
      `${THEME}\ncomponent B { base { @media (min-width: breakpoint.mdd) { color: red; } } }`,
      { filename: "range.arv" },
    ).diagnostics.find((x) => x.code === "ARV101");
    expect(d).toBeDefined();
    expect(d!.hint).toContain("breakpoint.md");
  });

  it("does not error on a non-theme dotted token in a condition (passes through)", () => {
    // `device.foo` is not a known group → left as literal text, no diagnostic.
    expect(
      codes(`${THEME}\ncomponent B { base { @media (min-width: device.foo) { color: red; } } }`),
    ).not.toContain("ARV101");
  });
});

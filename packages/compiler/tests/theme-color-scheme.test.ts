import { describe, expect, it } from "vitest";
import { compile } from "../src/index.js";

const compileOk = (source: string) => {
  const result = compile(source, { filename: "test.arv" });
  expect(result.diagnostics.filter((d) => d.severity === "error")).toEqual([]);
  return result;
};

describe("light/dark theme → color-scheme + light-dark()", () => {
  it("collapses mode-varying color tokens into a single light-dark() on :root", () => {
    const { css } = compileOk(
      `theme {
         modes: light | dark;
         color {
           primary = #0f766e;
           @dark { primary = #2dd4bf; }
         }
       }`,
    );
    expect(css).toContain("color-scheme: light dark;");
    expect(css).toContain("--arvia-color-primary: light-dark(#0f766e, #2dd4bf);");
    // No per-mode color override blocks — color-scheme drives the switch.
    expect(css).not.toMatch(/data-arvia-theme="dark"[^}]*--arvia-color-primary/s);
  });

  it("emits invariant tokens once, plainly", () => {
    const { css } = compileOk(
      `theme {
         modes: light | dark;
         color { primary = #0f766e; @dark { primary = #2dd4bf; } }
         space { 4 = 16px; }
       }`,
    );
    expect(css).toContain("--arvia-space-4: 16px;");
    expect(css).not.toContain("light-dark(16px");
  });

  it("attribute blocks only flip color-scheme when all varying tokens are colors", () => {
    const { css } = compileOk(
      `theme {
         modes: light | dark;
         color { primary = #0f766e; @dark { primary = #2dd4bf; } }
       }`,
    );
    expect(css).toMatch(/\[data-arvia-theme="light"\]\s*\{\s*color-scheme: light;\s*\}/);
    expect(css).toMatch(/\[data-arvia-theme="dark"\]\s*\{\s*color-scheme: dark;\s*\}/);
  });

  it("keeps per-mode override blocks for non-color varying tokens (box-shadow)", () => {
    const { css } = compileOk(
      `theme {
         modes: light | dark;
         color { primary = #0f766e; @dark { primary = #2dd4bf; } }
         shadow {
           sm = 0 1px 2px rgba(28, 25, 23, 0.05);
           @dark { sm = 0 1px 2px rgba(0, 0, 0, 0.45); }
         }
       }`,
    );
    // Color still collapses…
    expect(css).toContain("--arvia-color-primary: light-dark(#0f766e, #2dd4bf);");
    // …but the shadow keeps default-in-:root + OS + explicit overrides.
    expect(css).toContain("--arvia-shadow-sm: 0 1px 2px rgba(28, 25, 23, 0.05);");
    expect(css).toMatch(
      /@media \(prefers-color-scheme: dark\)[^}]*--arvia-shadow-sm: 0 1px 2px rgba\(0, 0, 0, 0\.45\)/s,
    );
    expect(css).toMatch(
      /data-arvia-theme="dark"[^}]*--arvia-shadow-sm: 0 1px 2px rgba\(0, 0, 0, 0\.45\)/s,
    );
  });

  it("falls back to legacy 4-block emission for non-color-scheme mode names", () => {
    const { css } = compileOk(
      `theme {
         modes: light | sepia;
         color {
           text = #111;
           @sepia { text = #5b4636; }
         }
       }`,
    );
    expect(css).not.toContain("color-scheme: light dark;");
    expect(css).not.toContain("light-dark(");
    expect(css).toContain('[data-arvia-theme="sepia"]');
    expect(css).toMatch(/data-arvia-theme="sepia"[^}]*--arvia-color-text: #5b4636/s);
  });
});

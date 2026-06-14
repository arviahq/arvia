import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compileDts } from "@arviahq/compiler";
import { themeEnvFor, themePathFor } from "../src/resolveTheme.js";

const demoButton = fileURLToPath(
  new URL("../../../examples/demo/src/components/button.arv", import.meta.url),
);

describe("resolveTheme", () => {
  it("finds the demo theme from a component path", () => {
    const themePath = themePathFor(demoButton);
    expect(themePath).toContain("examples/demo/src/theme.arv");
    const env = themeEnvFor(demoButton);
    // breakpoint / container-size are ordinary token groups now (mode-agnostic check:
    // values are plain strings in single-mode themes, per-mode objects when moded).
    expect(Object.keys(env?.tokens["breakpoint"] ?? {})).toEqual(
      expect.arrayContaining(["sm", "md", "lg"]),
    );
    expect(Object.keys(env?.tokens["container-size"] ?? {})).toEqual(
      expect.arrayContaining(["narrow", "wide"]),
    );
  });

  it("compiles the component dts without responsive prop surface", () => {
    const source = readFileSync(demoButton, "utf8");
    const { dts } = compileDts(source, { filename: demoButton, env: themeEnvFor(demoButton) });
    // Variant props still surface…
    expect(dts).toContain("size");
    expect(dts).toContain("tone");
    // …but the removed `responsive {}` block no longer emits a responsive prop.
    expect(dts).not.toContain("initial");
    expect(dts).not.toContain('"$wide"?:'); // Button has no container block
  });
});

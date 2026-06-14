import { describe, expect, it } from "vitest";
import { getSemanticTokens, semanticTokensLegend } from "../src/semantic-tokens.js";
import { analysisOf } from "./helpers.js";

interface Decoded {
  text: string;
  type: string;
  mods: string[];
}

/** Unpacks the LSP quintuple array back into readable tokens. */
function decode(source: string, data: number[]): Decoded[] {
  const lines = source.split("\n");
  const out: Decoded[] = [];
  let line = 0;
  let char = 0;
  for (let i = 0; i < data.length; i += 5) {
    line += data[i]!;
    char = data[i] === 0 ? char + data[i + 1]! : data[i + 1]!;
    const length = data[i + 2]!;
    const mods: string[] = [];
    for (let bit = 0; bit < semanticTokensLegend.tokenModifiers.length; bit++) {
      if (data[i + 4]! & (1 << bit)) mods.push(semanticTokensLegend.tokenModifiers[bit]!);
    }
    out.push({
      text: lines[line]!.slice(char, char + length),
      type: semanticTokensLegend.tokenTypes[data[i + 3]!]!,
      mods,
    });
  }
  return out;
}

const SOURCE = `theme {
  color { primary = #635bff; }
}

recipe Surface { background: white; }

keyframes spin { from { opacity: 0; } }

component Button {
  use Surface;
  slots { icon; }
  base {
    color: color.primary;
    animation: keyframes.spin 1s;
    icon { display: flex; }
    &:hover { icon { opacity: 1; } }
  }
  variants {
    tone { primary { color: red; } }
  }
  defaults { tone: primary; }
}`;

describe("semantic tokens", () => {
  const analysis = analysisOf(SOURCE);
  const tokens = decode(SOURCE, getSemanticTokens(analysis).data);
  const find = (text: string, type: string) =>
    tokens.filter((t) => t.text === text && t.type === type);

  it("classifies declarations with the declaration modifier", () => {
    expect(find("Button", "class")[0]!.mods).toContain("declaration");
    expect(find("Surface", "function")[0]!.mods).toContain("declaration");
    expect(find("spin", "type")[0]!.mods).toContain("declaration");
    expect(find("color", "namespace")).toHaveLength(1); // theme group
    expect(find("primary", "variable")[0]!.mods).toEqual(["declaration", "readonly"]);
  });

  it("distinguishes slots, variants and values contextually", () => {
    // `icon`: slot declaration + slot block + cross-slot state target.
    const icons = find("icon", "property");
    expect(icons.length).toBe(3);
    expect(icons[0]!.mods).toContain("declaration");

    expect(find("tone", "enum").length).toBe(2); // declaration + defaults key
    // `primary` as variant value: declaration + defaults value — distinct
    // from the token entry/ref classified as variable.
    expect(find("primary", "enumMember").length).toBe(2);
  });

  it("classifies refs by target kind", () => {
    expect(find("color.primary", "variable")[0]!.mods).toEqual(["readonly"]);
    expect(find("keyframes.spin", "type")).toHaveLength(1);
    expect(find("Surface", "function")).toHaveLength(2); // decl + use
  });

  it("emits position-sorted delta-encoded data", () => {
    const data = getSemanticTokens(analysis).data;
    expect(data.length % 5).toBe(0);
    for (let i = 0; i < data.length; i += 5) {
      expect(data[i]).toBeGreaterThanOrEqual(0); // line deltas never negative
    }
  });

  it("range requests return the subset", () => {
    const start = SOURCE.indexOf("recipe Surface");
    const end = SOURCE.indexOf("keyframes spin");
    const ranged = decode(SOURCE, getSemanticTokens(analysis, { start, end }).data);
    expect(ranged.map((t) => t.text)).toEqual(["Surface"]);
  });

  it("survives files with parse errors (recovered AST)", () => {
    const broken = analysisOf("component X { color red }\ncomponent Y { base { color: red; } }");
    const decoded = decode(broken.source, getSemanticTokens(broken).data);
    expect(decoded.some((t) => t.text === "Y" && t.type === "class")).toBe(true);
  });
});

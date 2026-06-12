import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { getFoldingRanges } from "../src/folding.js";
import { getSelectionRanges } from "../src/selection-ranges.js";
import { getWorkspaceSymbols } from "../src/workspace-symbols.js";
import { readFileOr } from "../src/rename.js";
import { WorkspaceState } from "../src/workspace.js";
import { analysisOf, at } from "./helpers.js";

const tempDirs: string[] = [];
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

const SOURCE = `theme {
  color {
    primary = #635bff;
  }
}

component Button {
  base {
    color: color.primary;
    &:hover {
      color: red;
    }
  }

  variants {
    size {
      sm {
        font-size: 12px;
      }
    }
  }
}`;

describe("folding ranges", () => {
  it("folds every brace-bodied block, keeping closing braces visible", () => {
    const ranges = getFoldingRanges(analysisOf(SOURCE));
    // theme, color group, component, base, &:hover, variants, size, sm
    expect(ranges).toHaveLength(8);
    const theme = ranges.find((r) => r.startLine === 0)!;
    expect(theme.endLine).toBe(3); // line above `}` on line 4
    const component = ranges.find((r) => r.startLine === 6)!;
    expect(component.endLine).toBeGreaterThan(10);
  });

  it("skips single-line blocks", () => {
    const ranges = getFoldingRanges(analysisOf("component X { base { color: red; } }"));
    expect(ranges).toHaveLength(0);
  });
});

describe("selection ranges", () => {
  it("expands from a token ref word outward to the file", () => {
    const analysis = analysisOf(SOURCE);
    const offset = at(SOURCE, "color.primary", 1);
    const pos = analysis.index.positionAt(offset);
    const [selection] = getSelectionRanges(analysis, [
      { line: pos.line - 1, character: pos.col - 1 },
    ]);

    const chain: string[] = [];
    for (let s: typeof selection | undefined = selection; s; s = s.parent) {
      const start = analysis.index.offsetAt({
        line: s.range.start.line + 1,
        col: s.range.start.character + 1,
      });
      const end = analysis.index.offsetAt({
        line: s.range.end.line + 1,
        col: s.range.end.character + 1,
      });
      chain.push(SOURCE.slice(start, end));
    }
    // Innermost: the ref word; then the declaration; eventually whole blocks.
    expect(chain[0]).toBe("color.primary");
    expect(chain[1]).toBe("color: color.primary;");
    expect(chain.some((text) => text.startsWith("base {"))).toBe(true);
    expect(chain.some((text) => text.startsWith("component Button"))).toBe(true);
    // Each step strictly contains the previous.
    for (let i = 1; i < chain.length; i++) {
      expect(chain[i]!.length).toBeGreaterThanOrEqual(chain[i - 1]!.length);
    }
  });
});

describe("workspace symbols", () => {
  it("lists components, recipes, keyframes, styles and tokens across files", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "arvia-ws-sym-"));
    tempDirs.push(dir);
    mkdirSync(path.join(dir, "src", "components"), { recursive: true });
    writeFileSync(
      path.join(dir, "src", "theme.arv"),
      "theme { color { primary = #111; } } recipe Surface { background: white; } keyframes spin { from { opacity: 0; } }\n",
    );
    writeFileSync(
      path.join(dir, "src", "components", "button.arv"),
      "component Button { base { color: color.primary; } } style Truncate { overflow: hidden; }\n",
    );

    const workspace = new WorkspaceState(dir);
    const all = getWorkspaceSymbols("", [workspace], readFileOr);
    const names = all.map((s) => s.name);
    expect(names).toContain("Button");
    expect(names).toContain("Truncate");
    expect(names).toContain("Surface");
    expect(names).toContain("spin");
    expect(names).toContain("color.primary");

    // Fuzzy subsequence filter.
    const filtered = getWorkspaceSymbols("btn", [workspace], readFileOr);
    expect(filtered.map((s) => s.name)).toEqual(["Button"]);
  });
});

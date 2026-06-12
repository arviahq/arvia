import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { getReferences } from "../src/references.js";
import { readFileOr } from "../src/rename.js";
import { WorkspaceState } from "../src/workspace.js";
import { analysisOf, at } from "./helpers.js";

const tempDirs: string[] = [];
afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
});

function tempWorkspace(): { dir: string; workspace: WorkspaceState } {
  const dir = mkdtempSync(path.join(os.tmpdir(), "arvia-refs-"));
  tempDirs.push(dir);
  return { dir, workspace: new WorkspaceState(dir) };
}

describe("references", () => {
  it("finds token entry, alias refs and component refs in one file", () => {
    const source = `theme {
  modes: light | dark;
  color { primary = #111; @dark { primary = #eee; } accent = color.primary; }
}
component X { base { background: color.primary; } }`;
    const analysis = analysisOf(source, { filename: "/proj/src/theme.arv" });
    const { workspace } = tempWorkspace();
    const refs = getReferences(analysis, at(source, "color.primary"), true, workspace, readFileOr);
    // base entry + @dark override entry (declarations) + alias ref + component ref
    expect(refs).toHaveLength(4);

    const withoutDecl = getReferences(
      analysis,
      at(source, "color.primary"),
      false,
      workspace,
      readFileOr,
    );
    expect(withoutDecl).toHaveLength(2);
  });

  it("local token references stay inside the component", () => {
    const source = `theme { m { pad = 1px; } }
component A { tokens { m { pad = 6px; } } base { padding: m.pad; } }
component B { base { padding: m.pad; } }`;
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    const refs = getReferences(analysis, at(source, "m.pad"), true, workspace, readFileOr);
    // A's local entry + A's ref — theme entry and B's ref excluded.
    expect(refs).toHaveLength(2);
  });

  it("finds variant value references across defaults and compound matchers", () => {
    const source = `component X {
  variants { tone { primary {} danger {} } }
  defaults { tone: danger; }
  compound { tone: danger; root { color: red; } }
}`;
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    const refs = getReferences(analysis, at(source, "danger"), true, workspace, readFileOr);
    // declaration + defaults entry + compound matcher
    expect(refs).toHaveLength(3);
  });

  it("finds recipe use sites", () => {
    const source = `recipe Surface { background: white; }
component X { use Surface; }
style Card { use Surface; }`;
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    const refs = getReferences(analysis, at(source, "Surface"), true, workspace, readFileOr);
    expect(refs).toHaveLength(3);
  });

  it("fans out across files when invoked from the theme file", () => {
    const { dir, workspace } = tempWorkspace();
    mkdirSync(path.join(dir, "src", "components"), { recursive: true });
    const themePath = path.join(dir, "src", "theme.arv");
    const buttonPath = path.join(dir, "src", "components", "button.arv");
    writeFileSync(themePath, "theme { color { primary = #111; } }\n");
    writeFileSync(buttonPath, "component Button { base { background: color.primary; } }\n");

    const themeSource = readFileOr(themePath)!;
    const analysis = analysisOf(themeSource, {
      filename: themePath,
      env: workspace.envFor(themePath),
    });
    const refs = getReferences(analysis, at(themeSource, "primary"), true, workspace, readFileOr);
    const uris = refs!.map((r) => r.uri);
    expect(uris).toContain(pathToFileURL(themePath).toString());
    expect(uris).toContain(pathToFileURL(buttonPath).toString());
  });

  it("fans out from a component file to the theme and siblings (inverse direction)", () => {
    const { dir, workspace } = tempWorkspace();
    mkdirSync(path.join(dir, "src", "components"), { recursive: true });
    const themePath = path.join(dir, "src", "theme.arv");
    const buttonPath = path.join(dir, "src", "components", "button.arv");
    const cardPath = path.join(dir, "src", "components", "card.arv");
    writeFileSync(themePath, "theme { color { primary = #111; } }\n");
    writeFileSync(buttonPath, "component Button { base { background: color.primary; } }\n");
    writeFileSync(cardPath, "component Card { base { border-color: color.primary; } }\n");

    const buttonSource = readFileOr(buttonPath)!;
    const analysis = analysisOf(buttonSource, {
      filename: buttonPath,
      env: workspace.envFor(buttonPath),
    });
    const refs = getReferences(
      analysis,
      at(buttonSource, "color.primary"),
      true,
      workspace,
      readFileOr,
    );
    const uris = refs!.map((r) => r.uri);
    expect(uris).toContain(pathToFileURL(buttonPath).toString());
    expect(uris).toContain(pathToFileURL(themePath).toString());
    expect(uris).toContain(pathToFileURL(cardPath).toString());
    expect(refs).toHaveLength(3);
  });

  it("component names return only their declaration", () => {
    const source = "component Button { base { color: red; } }";
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    const refs = getReferences(analysis, at(source, "Button"), true, workspace, readFileOr);
    expect(refs).toHaveLength(1);
  });

  it("returns null on plain CSS values", () => {
    const source = "component X { base { color: red; } }";
    const analysis = analysisOf(source);
    const { workspace } = tempWorkspace();
    expect(getReferences(analysis, at(source, "red"), true, workspace, readFileOr)).toBeNull();
  });
});

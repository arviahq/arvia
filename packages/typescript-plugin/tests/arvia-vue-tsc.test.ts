import { execFileSync, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";

const pkgDir = fileURLToPath(new URL("..", import.meta.url));
const cli = path.join(pkgDir, "dist", "vue-cli.cjs");

function runArviaVueTsc(project: string): { status: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [cli, "-p", project, "--noEmit"], {
      cwd: pkgDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, output };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { status: e.status ?? 1, output: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

beforeAll(() => {
  if (!existsSync(cli)) {
    execSync("npx tsup", { cwd: pkgDir, stdio: "inherit" });
  }
});

describe("arvia-tsc (Vue mode)", () => {
  it("typechecks .arv imports inside .vue SFCs with no .d.ts files on disk", () => {
    const fixture = path.join(pkgDir, "tests", "fixtures", "ok-vue");
    expect(existsSync(path.join(fixture, "button.arv.d.ts"))).toBe(false);
    const { status, output } = runArviaVueTsc(fixture);
    expect(output).not.toMatch(/error TS/);
    expect(status).toBe(0);
  });

  it("rejects invalid variant values used in a .vue SFC, located in the .vue file", () => {
    const fixture = path.join(pkgDir, "tests", "fixtures", "bad-vue");
    const { status, output } = runArviaVueTsc(fixture);
    expect(status).not.toBe(0);
    expect(output).toContain("App.vue");
    expect(output).toContain('"warning"');
    expect(output).toMatch(/error TS2322|error TS2345/);
  });
});

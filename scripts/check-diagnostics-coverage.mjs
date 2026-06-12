// Fails when the diagnostics reference page and the compiler disagree about
// which ARV codes exist — so the docs cannot silently drift.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;

const compilerOut = execSync(
  `grep -rhoE '"ARV[0-9]+"' ${root}packages/compiler/src --include='*.ts'`,
  { encoding: "utf8" },
);
const compilerCodes = new Set(compilerOut.match(/ARV\d+/g));

const docsSource = readFileSync(`${root}website/src/docs/pages/diagnostics.ts`, "utf8");
const docsCodes = new Set(docsSource.match(/ARV\d+/g));

const missing = [...compilerCodes].filter((code) => !docsCodes.has(code)).toSorted();
const stale = [...docsCodes].filter((code) => !compilerCodes.has(code)).toSorted();

if (missing.length > 0) {
  console.error(`✗ compiler codes missing from the diagnostics page: ${missing.join(", ")}`);
}
if (stale.length > 0) {
  console.error(
    `✗ diagnostics page documents codes the compiler no longer emits: ${stale.join(", ")}`,
  );
}
if (missing.length === 0 && stale.length === 0) {
  console.log(`✓ diagnostics page covers all ${compilerCodes.size} compiler codes`);
}
process.exit(missing.length + stale.length > 0 ? 1 : 0);

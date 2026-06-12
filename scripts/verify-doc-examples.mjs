// Compiles every Arvia code block in website/src/docs/pages/*.ts to prove
// the documentation examples are valid. Snippets that reference recipes
// defined in an earlier snippet on the same page are retried as a
// concatenation, mirroring how a reader encounters them.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { compile } = require("../packages/compiler/dist/index.cjs");

const pagesDir = new URL("../website/src/docs/pages/", import.meta.url).pathname;
const themeSource = readFileSync(
  new URL("../website/src/theme.arv", import.meta.url).pathname,
  "utf8",
);
const themeEnv = compile(themeSource, { filename: "theme.arv", sharedEnvFile: true }).env;

const ARV_START = /^\s*(\/\/.*\n\s*)*(theme|component|recipe|global|keyframes|style)\b/;

function extractCodeBlocks(source) {
  // Matches code: `...` template literals (no ${} interpolation is used in code blocks).
  const blocks = [];
  const re = /code: `((?:[^`\\]|\\.)*)`/g;
  for (const match of source.matchAll(re)) {
    blocks.push(match[1].replaceAll("\\`", "`").replaceAll("\\\\", "\\").replaceAll("\\$", "$"));
  }
  return blocks;
}

let checked = 0;
let failed = 0;

for (const file of readdirSync(pagesDir).filter((f) => f.endsWith(".ts"))) {
  const source = readFileSync(path.join(pagesDir, file), "utf8");
  const arvSnippets = extractCodeBlocks(source).filter((code) => ARV_START.test(code));
  const seen = [];

  for (const snippet of arvSnippets) {
    checked++;
    // Self-contained theme examples compile standalone; the rest see the website theme.
    const env = /\btheme\s*{/.test(snippet) ? undefined : themeEnv;
    const attempt = (code) =>
      compile(code, { filename: `docs-${file}.arv`, env }).diagnostics.filter(
        (d) => d.severity === "error",
      );

    let errors = attempt(snippet);
    if (errors.length > 0 && seen.length > 0) {
      errors = attempt([...seen, snippet].join("\n\n"));
    }
    if (errors.length > 0) {
      failed++;
      console.error(`✗ ${file}:`);
      console.error(snippet.split("\n").slice(0, 3).join("\n") + "\n  …");
      for (const e of errors) console.error(`  ${e.code} ${e.message} (line ${e.line})`);
    }
    seen.push(snippet);
  }
}

console.log(`\n${checked} Arvia snippets checked, ${failed} failing`);
process.exit(failed > 0 ? 1 : 0);

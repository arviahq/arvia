/** Whole-project CSS aggregation: combines the per-file {@link CssParts} of an
 *  entire project into one shared `global.css` plus one CSS string per
 *  component. This is the build/CLI-only step — it sees every file at once, so
 *  it can do what the per-file pipeline cannot: deduplicate repeated global
 *  blocks, promote keyframes shared by several components, and wrap the output
 *  in cascade layers for predictable ordering. The per-file HMR path never runs
 *  this; it keeps streaming the combined per-file CSS as before. */

import type { CssParts } from "./emit.js";

/** The canonical cascade-layer order. Emitted once at the top of `global.css`
 *  when {@link CssBundleOptions.layers} is on, so importing component files in
 *  any order can never change the result. */
export const ARVIA_LAYER_ORDER =
  "@layer arvia.tokens, arvia.reset, arvia.base, arvia.components, arvia.utilities;";

export interface CssBundleOptions {
  /** Wrap buckets in cascade layers and prepend the layer-order declaration.
   *  Off by default — enabling it changes cascade resolution, so it is opt-in. */
  layers?: boolean;
}

/** One project file's contribution to the bundle. */
export interface FileCss {
  parts: CssParts;
}

export interface CssBundle {
  /** Aggregated, deduplicated shared CSS: tokens, themes, resets, base styles,
   *  utilities and any keyframes shared by more than one component. */
  global: string;
  /** Per-component CSS, keyed by component name, with shared keyframes removed
   *  (they live in {@link CssBundle.global} instead). */
  components: { name: string; css: string }[];
}

const KEYFRAMES_RE = /^@(?:-[a-z]+-)?keyframes\b/i;

/**
 * Splits a CSS string into its top-level blocks (rule sets, block at-rules) and
 * statements (`@import …;`). Brace-aware, so nested rules and multi-step
 * keyframes stay intact — unlike a naive split on the blank-line separator.
 */
export function splitTopLevelBlocks(css: string): string[] {
  const blocks: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const block = css.slice(start, i + 1).trim();
        if (block) blocks.push(block);
        start = i + 1;
      }
    } else if (ch === ";" && depth === 0) {
      const stmt = css.slice(start, i + 1).trim();
      if (stmt) blocks.push(stmt);
      start = i + 1;
    }
  }
  const tail = css.slice(start).trim();
  if (tail) blocks.push(tail);
  return blocks;
}

/** Deduplicates blocks by exact text, preserving first-seen order. */
function dedupe(blocks: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const block of blocks) {
    if (seen.has(block)) continue;
    seen.add(block);
    out.push(block);
  }
  return out;
}

const wrapLayer = (layer: string, body: string): string =>
  body ? `@layer ${layer} {\n${body}\n}` : "";

const join = (blocks: string[]): string => blocks.join("\n\n");

/**
 * Aggregates the project's per-file parts into a shared global stylesheet and
 * per-component stylesheets.
 *
 * - **Global** collects every file's global bucket plus all standalone styles
 *   (utilities), deduplicated.
 * - **Keyframe promotion**: a `@keyframes` block defined identically by more
 *   than one component is moved into the global bucket once and stripped from
 *   each component (avoids shipping the same animation N times).
 * - **Layers** (opt-in) wrap tokens/base/utilities in the shared global file
 *   and each component in `arvia.components`, with the order declared up front.
 */
export function buildCssBundle(files: FileCss[], options: CssBundleOptions = {}): CssBundle {
  const layers = options.layers ?? false;

  // Collect raw global + utility blocks (utilities last, cascade-wise).
  const globalBlocks: string[] = [];
  const utilityBlocks: string[] = [];
  for (const { parts } of files) {
    if (parts.global) globalBlocks.push(...splitTopLevelBlocks(parts.global));
    if (parts.styles) utilityBlocks.push(...splitTopLevelBlocks(parts.styles));
  }

  // Split component CSS into blocks and tally keyframe usage across components
  // by the keyframe's exact text. A component that repeats the same keyframe
  // counts once (we track the set of owning component indices).
  const componentBlocks = files.flatMap(({ parts }) =>
    parts.components.map((c) => ({ name: c.name, blocks: splitTopLevelBlocks(c.css) })),
  );
  const keyframeOwners = new Map<string, Set<number>>();
  componentBlocks.forEach(({ blocks }, index) => {
    for (const block of blocks) {
      if (!KEYFRAMES_RE.test(block)) continue;
      (keyframeOwners.get(block) ?? keyframeOwners.set(block, new Set()).get(block)!).add(index);
    }
  });
  const promoted = new Set<string>();
  for (const [block, owners] of keyframeOwners) {
    if (owners.size > 1) promoted.add(block);
  }

  const components = componentBlocks.map(({ name, blocks }) => {
    const kept = blocks.filter((b) => !promoted.has(b));
    const css = layers ? wrapLayer("arvia.components", join(kept)) : join(kept);
    return { name, css };
  });

  // Promoted keyframes go to the shared file once, in first-seen order.
  const sharedKeyframes = dedupe([...promoted]);

  let global: string;
  if (layers) {
    const sections = [
      ARVIA_LAYER_ORDER,
      wrapLayer("arvia.base", join(dedupe([...globalBlocks, ...sharedKeyframes]))),
      wrapLayer("arvia.utilities", join(dedupe(utilityBlocks))),
    ].filter(Boolean);
    global = sections.join("\n\n");
  } else {
    global = join(dedupe([...globalBlocks, ...sharedKeyframes, ...utilityBlocks]));
  }

  return { global, components };
}

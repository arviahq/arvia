import { hashClass } from "./hash.js";
import type { ComponentIR } from "./ir.js";

// Minified names hash a structural descriptor scoped by the component's full
// identity — the untruncated project-relative path plus the component name, NOT
// the 6-char `c.hash` (which is itself truncated and so could collide between
// two components, guaranteeing a clash on shared descriptors like `root`).
// Seeding on the full identity makes every class input globally unique, so the
// only remaining collision source is the final hash truncation. The
// `bp:`/`cq:`/`c:` markers keep the descriptor spaces disjoint, so a plain
// variant can never alias a responsive/container/compound class.
const seed = (c: ComponentIR): string => `${c.rel}:${c.name}`;

export function baseClass(c: ComponentIR, slot: string): string {
  if (c.minify) return hashClass(seed(c), slot);
  return `${c.name}_${slot}_${c.hash}`;
}

export function variantClass(c: ComponentIR, variant: string, value: string, slot: string): string {
  if (c.minify) return hashClass(seed(c), `${variant}:${value}:${slot}`);
  return `${c.name}_${variant}_${value}_${slot}_${c.hash}`;
}

export function compoundClass(c: ComponentIR, match: [string, string][], slot: string): string {
  if (c.minify) {
    const path = match.map(([v, val]) => `${v}:${val}`).join(":");
    return hashClass(seed(c), `c:${path}:${slot}`);
  }
  const path = match.map(([v, val]) => `${v}_${val}`).join("_");
  return `${c.name}_${path}_${slot}_${c.hash}`;
}

/** Canonical key for a range head, used as the IR/DTS/runtime string key.
 *  `md`/`md..` → `"md"` (backward compatible); `..lg` → `"..lg"`; `sm..lg` →
 *  `"sm..lg"`. The parser guarantees at least one endpoint. */
export function rangeKey(lower: string | null, upper: string | null): string {
  if (lower && upper) return `${lower}..${upper}`;
  if (upper) return `..${upper}`;
  return lower ?? "";
}

/** CSS-class-safe segment for a canonical range key. Bare `md` stays `md`
 *  (backward compatible); `..lg` → `to_lg`; `sm..lg` → `sm_to_lg`. The minified
 *  path hashes the canonical key directly, so `..` need only be sanitized here. */
function rangeSegment(key: string): string {
  const idx = key.indexOf("..");
  if (idx === -1) return key;
  const lower = key.slice(0, idx);
  const upper = key.slice(idx + 2);
  return lower ? `${lower}_to_${upper}` : `to_${upper}`;
}

export function responsiveVariantClass(
  c: ComponentIR,
  variant: string,
  value: string,
  breakpoint: string,
  slot: string,
): string {
  if (c.minify) return hashClass(seed(c), `${variant}:${value}:bp:${breakpoint}:${slot}`);
  return `${c.name}_${variant}_${value}_bp_${rangeSegment(breakpoint)}_${slot}_${c.hash}`;
}

export function containerVariantClass(
  c: ComponentIR,
  variant: string,
  value: string,
  container: string,
  slot: string,
): string {
  if (c.minify) return hashClass(seed(c), `${variant}:${value}:cq:${container}:${slot}`);
  return `${c.name}_${variant}_${value}_cq_${rangeSegment(container)}_${slot}_${c.hash}`;
}

import { hashClass } from "./hash.js";
import type { ComponentIR } from "./ir.js";

// Minified names hash a structural descriptor scoped by the component's full
// identity — the untruncated project-relative path plus the component name, NOT
// the 6-char `c.hash` (which is itself truncated and so could collide between
// two components, guaranteeing a clash on shared descriptors like `root`).
// Seeding on the full identity makes every class input globally unique, so the
// only remaining collision source is the final hash truncation. The `c:` marker
// keeps the compound descriptor space disjoint, so a plain variant can never
// alias a compound class.
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

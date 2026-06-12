/** Stable anchor ids for docs headings, shared by DocH2/DocH3 and the TOC. */
export function headingId(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

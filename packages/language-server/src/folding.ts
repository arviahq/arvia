import type { FoldingRange } from "vscode-languageserver";
import type { DocumentAnalysis } from "./documents.js";
import { visitSpans } from "./spans.js";

/** One folding range per brace-bodied node, keeping the closing brace
 *  visible (VS Code's default brace convention). */
export function getFoldingRanges(analysis: DocumentAnalysis): FoldingRange[] {
  const ranges: FoldingRange[] = [];
  visitSpans(analysis.ast, (span, foldable) => {
    if (!foldable) return;
    const range = analysis.index.spanToRange(span);
    const startLine = range.start.line - 1;
    const endLine = range.end.line - 2; // line above the closing brace
    if (endLine > startLine) ranges.push({ startLine, endLine });
  });
  return ranges;
}

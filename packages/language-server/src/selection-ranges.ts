import type { Position, SelectionRange } from "vscode-languageserver";
import type { DocumentAnalysis } from "./documents.js";
import { spanPathAt } from "./spans.js";

/** Expanding selection: innermost span chained outward to the whole file. */
export function getSelectionRanges(
  analysis: DocumentAnalysis,
  positions: Position[],
): SelectionRange[] {
  return positions.map((position) => {
    const offset = analysis.index.offsetAt({
      line: position.line + 1,
      col: position.character + 1,
    });
    const path = spanPathAt(analysis.ast, offset);

    let current: SelectionRange = {
      range: {
        start: { line: 0, character: 0 },
        end: lspPosition(analysis, analysis.source.length),
      },
    };
    for (const span of path) {
      const range = analysis.index.spanToRange(span);
      current = {
        range: {
          start: { line: range.start.line - 1, character: range.start.col - 1 },
          end: { line: range.end.line - 1, character: range.end.col - 1 },
        },
        parent: current,
      };
    }
    return current;
  });
}

function lspPosition(analysis: DocumentAnalysis, offset: number) {
  const pos = analysis.index.positionAt(offset);
  return { line: pos.line - 1, character: pos.col - 1 };
}

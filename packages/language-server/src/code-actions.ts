import type {
  CodeAction,
  CodeActionContext,
  Diagnostic as LspDiagnostic,
  Range,
  TextEdit,
} from "vscode-languageserver";
import type { DiagnosticFix } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";
import { lspRange, type FixData } from "./lints.js";

/**
 * Quick fixes from diagnostic fix data: did-you-mean replacements attached by
 * the compiler checker, plus the lint fixes from lints.ts (insert defaults,
 * remove unused slot). Fix payloads ride on `diagnostic.data`; when a client
 * drops `data`, compiler fixes are recovered from the cached analysis.
 */
export function getCodeActions(
  analysis: DocumentAnalysis,
  context: CodeActionContext,
  uri: string,
): CodeAction[] {
  const actions: CodeAction[] = [];
  for (const diagnostic of context.diagnostics) {
    const data = fixDataOf(diagnostic) ?? recoverFixData(analysis, diagnostic);
    if (!data) continue;
    actions.push({
      title: data.fix.title,
      kind: "quickfix",
      diagnostics: [diagnostic],
      isPreferred: data.preferred !== false,
      edit: {
        changes: {
          [uri]: data.fix.edits.map(
            (e): TextEdit => ({ range: lspRange(analysis.index, e.span), newText: e.newText }),
          ),
        },
      },
    });
  }
  return actions;
}

function fixDataOf(diagnostic: LspDiagnostic): FixData | null {
  const data = diagnostic.data as Partial<FixData> | undefined;
  return data && typeof data === "object" && data.fix ? (data as FixData) : null;
}

/** Re-match a compiler diagnostic by code + range when `data` went missing. */
function recoverFixData(analysis: DocumentAnalysis, diagnostic: LspDiagnostic): FixData | null {
  if (!diagnostic.code) return null;
  for (const d of analysis.diagnostics) {
    if (!d.fix || d.code !== diagnostic.code) continue;
    if (rangesEqual(lspRange(analysis.index, d.span), diagnostic.range)) {
      return { fix: d.fix as DiagnosticFix };
    }
  }
  return null;
}

function rangesEqual(a: Range, b: Range): boolean {
  return (
    a.start.line === b.start.line &&
    a.start.character === b.start.character &&
    a.end.line === b.end.line &&
    a.end.character === b.end.character
  );
}

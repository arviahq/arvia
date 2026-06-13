import type { SemanticTokens, SemanticTokensLegend } from "vscode-languageserver";
import type { ArviaFile, Span, StyleBody, StyleItem } from "@arviahq/compiler";
import type { DocumentAnalysis } from "./documents.js";
import { walkTokenEntries, walkUses, walkValues } from "./walk.js";

/**
 * Semantic highlighting for what TextMate cannot resolve contextually:
 * slot vs variant vs token identifiers. CSS properties, states, strings and
 * keywords stay with the TextMate grammar (faster first paint, no benefit
 * from re-emitting them here).
 */
export const semanticTokensLegend: SemanticTokensLegend = {
  tokenTypes: [
    "class", // component names
    "property", // slot names
    "enum", // variant names
    "enumMember", // variant values
    "variable", // token entries/refs, style names, breakpoint/container keys
    "function", // recipes
    "type", // keyframes
    "namespace", // token group names
  ],
  tokenModifiers: ["declaration", "readonly"],
};

const CLASS = 0;
const PROPERTY = 1;
const ENUM = 2;
const ENUM_MEMBER = 3;
const VARIABLE = 4;
const FUNCTION = 5;
const TYPE = 6;
const NAMESPACE = 7;

const DECLARATION = 1 << 0;
const READONLY = 1 << 1;

interface Tok {
  span: Span;
  type: number;
  mods: number;
}

export function getSemanticTokens(
  analysis: DocumentAnalysis,
  range?: { start: number; end: number },
): SemanticTokens {
  let tokens = collect(analysis.ast);
  if (range) {
    tokens = tokens.filter((t) => t.span.end >= range.start && t.span.start <= range.end);
  }
  tokens.sort((a, b) => a.span.start - b.span.start);

  const data: number[] = [];
  let prevLine = 0;
  let prevChar = 0;
  for (const token of tokens) {
    const pos = analysis.index.positionAt(token.span.start);
    const line = pos.line - 1;
    const char = pos.col - 1;
    data.push(
      line - prevLine,
      line === prevLine ? char - prevChar : char,
      token.span.end - token.span.start,
      token.type,
      token.mods,
    );
    prevLine = line;
    prevChar = char;
  }
  return { data };
}

function collect(ast: ArviaFile): Tok[] {
  const out: Tok[] = [];
  const push = (span: Span, type: number, mods = 0) => {
    out.push({ span, type, mods });
  };

  const slotBlocks = (items: (StyleItem | { kind: "slotblock" })[]) => {
    for (const item of items as StyleBody["items"]) {
      if (item.kind === "slotblock") {
        push(item.nameSpan, PROPERTY);
        slotBlocks(item.items);
      } else if (item.kind === "state") {
        for (const slot of item.slots) {
          push(slot.nameSpan, PROPERTY);
        }
      }
    }
  };
  const body = (b: StyleBody) => slotBlocks(b.items);

  const settings = (entries: { variantSpan: Span; valueSpan: Span }[]) => {
    for (const entry of entries) {
      push(entry.variantSpan, ENUM);
      push(entry.valueSpan, ENUM_MEMBER);
    }
  };

  for (const top of ast.items) {
    switch (top.kind) {
      case "component":
        push(top.nameSpan, CLASS, DECLARATION);
        for (const item of top.items) {
          switch (item.kind) {
            case "base":
              body(item.body);
              break;
            case "slots":
              for (const slot of item.slots) {
                push(slot.nameSpan, PROPERTY, DECLARATION);
                slotBlocks(slot.items);
              }
              break;
            case "variants":
              for (const variant of item.variants) {
                push(variant.nameSpan, ENUM, DECLARATION);
                for (const value of variant.values) {
                  push(value.nameSpan, ENUM_MEMBER, DECLARATION);
                  body(value.body);
                }
              }
              break;
            case "defaults":
              settings(item.entries);
              break;
            case "responsive":
            case "container":
              for (const entry of item.entries) {
                if (entry.lowerSpan) push(entry.lowerSpan, VARIABLE, READONLY);
                if (entry.upperSpan) push(entry.upperSpan, VARIABLE, READONLY);
                settings(entry.variants);
              }
              break;
            case "compound":
              settings(item.matchers);
              for (const slot of item.slots) {
                push(slot.nameSpan, PROPERTY);
                slotBlocks(slot.items);
              }
              break;
            case "tokens":
              for (const group of item.groups) push(group.nameSpan, NAMESPACE);
              break;
          }
        }
        break;
      case "styledecl":
        push(top.nameSpan, VARIABLE, DECLARATION | READONLY);
        slotBlocks(top.items);
        break;
      case "recipe":
        push(top.nameSpan, FUNCTION, DECLARATION);
        slotBlocks(top.items);
        break;
      case "keyframes":
        push(top.nameSpan, TYPE, DECLARATION);
        break;
      case "theme":
        for (const group of top.groups) push(group.nameSpan, NAMESPACE);
        break;
    }
  }

  for (const { entry } of walkTokenEntries(ast)) {
    push(entry.nameSpan, VARIABLE, DECLARATION | READONLY);
  }
  for (const use of walkUses(ast)) {
    push(use.recipeSpan, FUNCTION);
  }
  for (const { value } of walkValues(ast)) {
    for (const word of value.words) {
      if (word.kind !== "ref") continue;
      if (word.group === "keyframes") push(word.span, TYPE);
      else push(word.span, VARIABLE, READONLY);
    }
  }

  return out;
}

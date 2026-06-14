import type {
  ArviaFile,
  AtRule,
  AtRuleBody,
  ComponentItem,
  Declaration,
  Span,
  StyleBody,
  StyleItem,
  SlotBlock,
  TokenEntry,
  TokenGroup,
} from "@arviahq/compiler";

/**
 * Visits every spanned node in nesting order (parents before children).
 * `foldable` marks brace-bodied nodes — the folding provider's input;
 * selection ranges use all spans.
 */
export function visitSpans(ast: ArviaFile, visit: (span: Span, foldable: boolean) => void): void {
  const value = (entry: TokenEntry) => {
    visit(entry.span, false);
    visit(entry.value.span, false);
    for (const word of entry.value.words) visit(word.span, false);
  };
  const tokenGroup = (group: TokenGroup) => {
    visit(group.span, true);
    for (const entry of group.entries) value(entry);
    for (const override of group.overrides) {
      visit(override.span, true);
      for (const entry of override.entries) value(entry);
    }
  };
  const decl = (d: Declaration) => {
    visit(d.span, false);
    visit(d.value.span, false);
    for (const word of d.value.words) visit(word.span, false);
  };
  const slotBlock = (slot: SlotBlock) => {
    visit(slot.span, true);
    styleItems(slot.items);
  };
  const atRuleBody = (b: AtRuleBody) => {
    for (const d of b.decls) decl(d);
    for (const rule of b.rules) {
      visit(rule.span, true);
      atRuleBody(rule.body);
    }
    for (const nested of b.atRules) atRule(nested);
  };
  const atRule = (a: AtRule) => {
    visit(a.span, true);
    if (a.body) atRuleBody(a.body);
  };
  const styleItems = (items: StyleItem[]) => {
    for (const item of items) {
      if (item.kind === "decl") {
        decl(item);
      } else if (item.kind === "use") {
        visit(item.span, false);
      } else if (item.kind === "atrule") {
        atRule(item);
      } else {
        visit(item.span, true);
        for (const d of item.items) decl(d);
        for (const slot of item.slots) slotBlock(slot);
      }
    }
  };
  const body = (b: StyleBody) => {
    for (const item of b.items) {
      if (item.kind === "slotblock") slotBlock(item);
      else styleItems([item]);
    }
  };
  const componentItem = (item: ComponentItem) => {
    switch (item.kind) {
      case "decl":
        decl(item);
        break;
      case "use":
        visit(item.span, false);
        break;
      case "base":
        visit(item.span, true);
        body(item.body);
        break;
      case "slots":
        visit(item.span, true);
        for (const slot of item.slots) {
          visit(slot.span, true);
          styleItems(slot.items);
        }
        break;
      case "variants":
        visit(item.span, true);
        for (const variant of item.variants) {
          visit(variant.span, true);
          for (const v of variant.values) {
            visit(v.span, true);
            body(v.body);
          }
        }
        break;
      case "defaults":
        visit(item.span, true);
        for (const entry of item.entries) visit(entry.span, false);
        break;
      case "atrule":
        atRule(item);
        break;
      case "compound":
        visit(item.span, true);
        for (const matcher of item.matchers) visit(matcher.span, false);
        for (const slot of item.slots) slotBlock(slot);
        break;
      case "tokens":
        visit(item.span, true);
        for (const group of item.groups) tokenGroup(group);
        break;
    }
  };

  for (const item of ast.items) {
    switch (item.kind) {
      case "theme":
        visit(item.span, true);
        for (const group of item.groups) tokenGroup(group);
        break;
      case "global":
        visit(item.span, true);
        for (const rule of item.rules) {
          visit(rule.span, true);
          for (const d of rule.decls) decl(d);
        }
        for (const a of item.atRules) atRule(a);
        break;
      case "atrule":
        atRule(item);
        break;
      case "recipe":
      case "styledecl":
        visit(item.span, true);
        styleItems(item.items);
        break;
      case "component":
        visit(item.span, true);
        for (const ci of item.items) componentItem(ci);
        break;
    }
  }
}

/** All spans containing `offset`, outermost first (walk order is nesting
 *  order), deduplicated. */
export function spanPathAt(ast: ArviaFile, offset: number): Span[] {
  const path: Span[] = [];
  visitSpans(ast, (span) => {
    if (offset < span.start || offset > span.end) return;
    const last = path[path.length - 1];
    if (last && last.start === span.start && last.end === span.end) return;
    path.push(span);
  });
  return path;
}

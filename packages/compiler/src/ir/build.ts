import type {
  AtRule,
  ArviaFile,
  ComponentDecl,
  RawRule,
  RawValue,
  StyleBody,
  StyleDecl,
  StyleItem,
} from "../ast/nodes.js";
import {
  emptyStyle,
  isEmptyStyle,
  type AtRuleIR,
  type ComponentIR,
  type CompoundIR,
  type FileIR,
  type GlobalRuleIR,
  type RawRuleIR,
  type StyleDeclIR,
  type StyleIR,
  type ThemeEnv,
  type ThemeVarIR,
  type VariantIR,
} from "./ir.js";
import { hashClass, hashName, relativeName } from "./hash.js";
import { splitValueWords } from "../parser/parser.js";
import {
  substituteRefs,
  substituteRefsForMode,
  substitutePreludeRefs,
  type LocalTokens,
} from "../values.js";

export interface BuildOptions {
  filename: string;
  root?: string;
  /** Emit short hashed class names instead of readable ones (production). */
  minify?: boolean;
}

/** Builds the file IR. Must only be called after `check` reported no errors. */
export function buildIR(ast: ArviaFile, env: ThemeEnv, options: BuildOptions): FileIR {
  const rel = relativeName(options.filename, options.root);

  // Component tokens shadow theme tokens while their component is being built.
  let localTokens: LocalTokens | null = null;
  const resolveValue = (value: RawValue): string =>
    substituteRefs(value, env, undefined, localTokens);

  // Final CSS head for an at-rule. Token refs in the prelude inline to literals
  // (never var() — invalid in conditions); everything else passes through.
  const buildPrelude = (node: AtRule): string => {
    if (!node.prelude || !node.preludeSpan) return `@${node.name}`;
    const value: RawValue = {
      text: node.prelude,
      words: splitValueWords(node.prelude, node.preludeSpan),
      span: node.preludeSpan,
    };
    return `@${node.name} ${substitutePreludeRefs(value, env)}`;
  };

  // `@keyframes` bodies are pure pass-through — no token rewriting; other
  // at-rules resolve token refs in their declarations like ordinary rules.
  const buildRawRule = (rule: RawRule, passthrough: boolean): RawRuleIR => ({
    selector: rule.selector,
    decls: rule.body.decls.map((d) => ({
      property: d.property,
      value: passthrough ? d.value.text : resolveValue(d.value),
    })),
    rules: rule.body.rules.map((r) => buildRawRule(r, passthrough)),
    atRules: rule.body.atRules.map((a) => buildAtRule(a, passthrough)),
  });

  // Raw CSS content of an at-rule (declarations / nested rules / nested
  // at-rules). Arvia constructs in `body.items` are NOT raw — they're hoisted
  // separately by `collectConstructs`, so a nested at-rule that holds only
  // constructs (no raw content) is dropped here to avoid emitting `@media {}`.
  const hasRawContent = (node: AtRule): boolean => {
    if (!node.body) return true; // statement at-rule always emits
    return (
      node.body.decls.length > 0 ||
      node.body.rules.length > 0 ||
      node.body.atRules.some(hasRawContent)
    );
  };

  const buildAtRule = (node: AtRule, inheritedPassthrough: boolean): AtRuleIR => {
    const prelude = buildPrelude(node);
    if (!node.body) {
      return { name: node.name, prelude, statement: true, decls: [], rules: [], atRules: [] };
    }
    const passthrough = inheritedPassthrough || node.name === "keyframes";
    return {
      name: node.name,
      prelude,
      decls: node.body.decls.map((d) => ({
        property: d.property,
        value: passthrough ? d.value.text : resolveValue(d.value),
      })),
      rules: node.body.rules.map((r) => buildRawRule(r, passthrough)),
      atRules: node.body.atRules.filter(hasRawContent).map((a) => buildAtRule(a, passthrough)),
      anchor: node.nameSpan,
    };
  };

  const applyItems = (target: StyleIR, items: StyleItem[]) => {
    for (const item of items) {
      if (item.kind === "decl") {
        target.decls.push({ property: item.property, value: resolveValue(item.value) });
      } else if (item.kind === "atrule") {
        target.atRules.push(buildAtRule(item, false));
      } else if (item.kind === "use") {
        const recipe = env.recipes[item.recipe];
        if (recipe) {
          target.decls.push(...recipe.decls);
          target.states.push(...recipe.states);
          target.atRules.push(...recipe.atRules);
        }
      } else {
        const state: StyleIR["states"][number] = {
          selectors: item.selectors,
          decls: item.items.map((d) => ({ property: d.property, value: resolveValue(d.value) })),
        };
        if (item.slots.length > 0) {
          const slotDecls: Record<string, { property: string; value: string }[]> = {};
          for (const slot of item.slots) {
            (slotDecls[slot.name] ??= []).push(
              ...slot.items.flatMap((d) =>
                d.kind === "decl" ? [{ property: d.property, value: resolveValue(d.value) }] : [],
              ),
            );
          }
          state.slotDecls = slotDecls;
        }
        target.states.push(state);
      }
    }
  };

  const applyBody = (body: StyleBody, ensure: (slot: string) => StyleIR) => {
    for (const item of body.items) {
      if (item.kind === "slotblock") {
        applyItems(ensure(item.name), item.items);
      } else {
        applyItems(ensure("root"), [item]);
      }
    }
  };

  const globals: GlobalRuleIR[] = [];
  const globalAtRules: AtRuleIR[] = [];
  const components: FileIR["components"] = [];
  const styles: StyleDeclIR[] = [];
  const themeVars: ThemeVarIR[] = [];
  let themeModes: string[] | null = null;

  const buildStyleDecl = (top: StyleDecl, layers: string[]): StyleDeclIR => {
    const style = emptyStyle();
    applyItems(style, top.items);
    const hash = hashName(rel, top.name);
    return {
      name: top.name,
      nameSpan: top.nameSpan,
      hash,
      className: options.minify ? hashClass(`${rel}:${top.name}`, "style") : `${top.name}_${hash}`,
      style,
      ...(layers.length > 0 ? { layers } : {}),
    };
  };

  const buildComponent = (top: ComponentDecl, layers: string[]): ComponentIR => {
    const slotNames = ["root"];
    const componentTokens: LocalTokens = {};
    let hasComponentTokens = false;
    for (const item of top.items) {
      if (item.kind === "tokens") {
        for (const group of item.groups) {
          const bucket = (componentTokens[group.name] ??= {});
          for (const entry of group.entries) {
            if (bucket[entry.name] === undefined) {
              bucket[entry.name] = entry.value.text;
              hasComponentTokens = true;
            }
          }
        }
        continue;
      }
      if (item.kind !== "slots") continue;
      for (const slot of item.slots) {
        if (!slotNames.includes(slot.name)) slotNames.push(slot.name);
      }
    }
    localTokens = hasComponentTokens ? componentTokens : null;

    const base: Record<string, StyleIR> = {};
    for (const slot of slotNames) base[slot] = emptyStyle();
    const ensureBase = (slot: string) => (base[slot] ??= emptyStyle());

    const variants: VariantIR[] = [];
    const defaults: Record<string, string> = {};
    const pendingCompounds: { matchers: [string, string][]; slots: Record<string, StyleIR> }[] = [];

    for (const item of top.items) {
      switch (item.kind) {
        case "decl":
        case "use":
        case "atrule":
          applyItems(ensureBase("root"), [item]);
          break;
        case "base":
          applyBody(item.body, ensureBase);
          break;
        case "slots":
          for (const slot of item.slots) applyItems(ensureBase(slot.name), slot.items);
          break;
        case "variants":
          for (const variant of item.variants) {
            variants.push({
              name: variant.name,
              values: variant.values.map((value) => {
                const slots: Record<string, StyleIR> = {};
                applyBody(value.body, (slot) => (slots[slot] ??= emptyStyle()));
                pruneEmpty(slots);
                return { name: value.name, slots };
              }),
            });
          }
          break;
        case "defaults":
          for (const entry of item.entries) defaults[entry.variant] = entry.value;
          break;
        case "compound": {
          const slots: Record<string, StyleIR> = {};
          for (const slot of item.slots) {
            applyItems((slots[slot.name] ??= emptyStyle()), slot.items);
          }
          pruneEmpty(slots);
          pendingCompounds.push({
            matchers: item.matchers.map((m) => [m.variant, m.value]),
            slots,
          });
          break;
        }
      }
    }
    localTokens = null;

    const variantOrder = new Map(variants.map((v, i) => [v.name, i]));
    const compounds: CompoundIR[] = pendingCompounds.map((c) => ({
      match: c.matchers.toSorted(
        (a, b) => (variantOrder.get(a[0]) ?? 0) - (variantOrder.get(b[0]) ?? 0),
      ),
      slots: c.slots,
    }));

    return {
      name: top.name,
      nameSpan: top.nameSpan,
      hash: hashName(rel, top.name),
      rel,
      minify: options.minify ?? false,
      slotNames,
      base,
      variants,
      compounds,
      defaults,
      ...(layers.length > 0 ? { layers } : {}),
    };
  };

  // Components/styles declared inside an at-rule are hoisted to the flat IR
  // arrays, tagged with the enclosing at-rule prelude chain (outer→inner).
  const collectConstructs = (node: AtRule, layers: string[]) => {
    if (!node.body) return;
    const chain = [...layers, buildPrelude(node)];
    for (const item of node.body.items) {
      if (item.kind === "component") components.push(buildComponent(item, chain));
      else styles.push(buildStyleDecl(item, chain));
    }
    for (const child of node.body.atRules) collectConstructs(child, chain);
  };

  for (const top of ast.items) {
    if (top.kind === "theme") {
      themeModes = env.modes;
      for (const group of top.groups) {
        const bucket = env.tokens[group.name];
        if (!bucket) continue;
        for (const entry of group.entries) {
          const rawByMode: Record<string, RawValue> = env.modes
            ? { [env.modes[0]!]: entry.value }
            : { default: entry.value };
          if (env.modes) {
            for (const override of group.overrides) {
              for (const o of override.entries) {
                if (o.name === entry.name) rawByMode[override.mode] = o.value;
              }
            }
          }
          const byMode: Record<string, string> = {};
          const modes = env.modes ?? ["default"];
          for (const mode of modes) {
            const raw = rawByMode[mode] ?? entry.value;
            byMode[mode] = env.modes
              ? substituteRefsForMode(raw, env.tokens, mode, env.modes)
              : substituteRefs(raw, env);
          }
          themeVars.push({
            group: group.name,
            name: entry.name,
            doc: env.tokenDocs[group.name]?.[entry.name] ?? entry.doc,
            byMode,
          });
        }
      }
      continue;
    }
    if (top.kind === "atrule") {
      if (hasRawContent(top)) globalAtRules.push(buildAtRule(top, false));
      collectConstructs(top, []);
      continue;
    }
    if (top.kind === "global") {
      for (const rule of top.rules) {
        globals.push({
          selector: rule.selector,
          decls: rule.decls.map((d) => ({ property: d.property, value: resolveValue(d.value) })),
        });
      }
      for (const at of top.atRules) {
        if (hasRawContent(at)) globalAtRules.push(buildAtRule(at, false));
        collectConstructs(at, []);
      }
      continue;
    }
    if (top.kind === "styledecl") {
      styles.push(buildStyleDecl(top, []));
      continue;
    }
    if (top.kind === "component") {
      components.push(buildComponent(top, []));
    }
  }

  return {
    globals,
    globalAtRules,
    components,
    styles,
    themeVars,
    themeModes,
  };
}

function pruneEmpty(slots: Record<string, StyleIR>) {
  for (const key of Object.keys(slots)) {
    if (isEmptyStyle(slots[key]!)) delete slots[key];
  }
}

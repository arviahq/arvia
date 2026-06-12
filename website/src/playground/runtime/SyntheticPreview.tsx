import type { ElementType } from "react";
import type { CompileResult } from "@arviahq/compiler";
import { childTagFor, previewTagFor, slotSampleText } from "./app-snippets";

interface AppUsage {
  props: Record<string, string>;
  tag: string;
  rootText: string;
  children: { slot: string; tag: string; text: string }[];
}

/** Best-effort read of the app source usage: variant props, element tag, slot children. */
function parseUsage(app: string, componentName: string): AppUsage | null {
  const call = app.match(new RegExp(`\\b${componentName}\\s*\\(([^)]*)\\)`));
  if (!call) return null;

  const props: Record<string, string> = {};
  for (const m of (call[1] ?? "").matchAll(/([A-Za-z_$][\w$]*)\s*:\s*["']([^"']*)["']/g)) {
    props[m[1] ?? ""] = m[2] ?? "";
  }

  // Greedy body match: the root may contain children of the same tag (div in div),
  // so capture through to the LAST matching close tag.
  const root =
    app.match(/<([a-zA-Z][\w]*)\s[^>]*className=\{styles\.root\}[^>]*>([\s\S]*)<\/\1>/) ??
    app.match(/<([a-zA-Z][\w]*)\b[^>]*>([\s\S]*)<\/\1>/);
  const tag = root?.[1] ?? "div";
  const inner = root?.[2] ?? "";

  const children: AppUsage["children"] = [];
  for (const m of inner.matchAll(/<(\w+)\s[^>]*className=\{styles\.(\w+)\}[^>]*>([^<]*)<\/\1>/g)) {
    children.push({ tag: m[1] ?? "span", slot: m[2] ?? "", text: (m[3] ?? "").trim() });
  }

  const rootText = inner
    .replace(/<(\w+)[^>]*>[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]*\/>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .trim();

  return { props, tag, rootText, children };
}

/** Renders what the app source describes — an approximation in the host React
 *  app (used on the homepage, where the real-execution iframe isn't worth its
 *  CDN + iframe cost). Falls back to one instance per first-variant value. */
export function SyntheticPreview({
  meta,
  app,
  css,
  sampleText,
  emptyHint,
  clickMe,
}: {
  meta: CompileResult["meta"];
  app: string;
  css: string;
  sampleText: string;
  emptyHint: string;
  clickMe: string;
}) {
  const component = meta.components[0];
  if (!component) {
    const style = meta.styles[0];
    if (style) {
      const text = app.match(/>([^<{]+)</)?.[1]?.trim();
      return (
        <p className={style.className} style={{ margin: 0 }}>
          {text || sampleText}
        </p>
      );
    }
    return <span style={{ opacity: 0.6, fontSize: 13 }}>{emptyHint}</span>;
  }

  const classFor = (slot: string, overrides: Record<string, string>): string => {
    const classes = [`${component.name}_${slot}_${component.hash}`];
    const activePairs: string[] = [];
    for (const variant of component.variants) {
      const override = overrides[variant.name];
      const value =
        override && variant.values.includes(override) ? override : component.defaults[variant.name];
      if (value) {
        activePairs.push(`${variant.name}_${value}`);
        classes.push(`${component.name}_${variant.name}_${value}_${slot}_${component.hash}`);
      }
    }

    // Compound variants emit one class per combination (Name_size_sm_tone_danger_root_hash).
    // Scan the CSS for combo classes whose segments are all currently-active pairs.
    const comboRe = new RegExp(`\\.${component.name}_(.+?)_${slot}_${component.hash}\\b`, "g");
    for (const m of css.matchAll(comboRe)) {
      const middle = m[1] ?? "";
      let rest = middle;
      let pairs = 0;
      while (rest) {
        const pair = activePairs.find((p) => rest === p || rest.startsWith(`${p}_`));
        if (!pair) {
          pairs = 0;
          break;
        }
        rest = rest === pair ? "" : rest.slice(pair.length + 1);
        pairs += 1;
      }
      if (pairs >= 2) classes.push(`${component.name}_${middle}_${slot}_${component.hash}`);
    }

    return [...new Set(classes)].join(" ");
  };

  // contain: inline-size (container queries) zeroes the root's intrinsic width,
  // so those components need an explicit stage to render at a visible size.
  const needsWidthStage = /container-type/.test(css);

  const renderInstance = (
    key: string,
    overrides: Record<string, string>,
    tag: string,
    rootText: string,
    children: AppUsage["children"],
  ) => {
    const Root = (/^[a-z][a-z0-9]*$/.test(tag) ? tag : "div") as ElementType;
    return (
      <Root
        key={key}
        type={tag === "button" ? "button" : undefined}
        className={classFor("root", overrides)}
        style={needsWidthStage ? { width: "min(420px, 100%)" } : undefined}
      >
        {rootText || null}
        {children.map((child, i) => {
          const Child = (/^[a-z][a-z0-9]*$/.test(child.tag) ? child.tag : "span") as ElementType;
          return (
            <Child
              key={`${child.slot}-${i}`}
              className={
                component.slots.includes(child.slot) ? classFor(child.slot, overrides) : undefined
              }
            >
              {child.text}
            </Child>
          );
        })}
      </Root>
    );
  };

  const defaultTag = previewTagFor(css);
  const defaultChildren = (label: string): AppUsage["children"] =>
    component.slots
      .filter((s) => s !== "root")
      .map((slot) => ({ slot, tag: childTagFor(slot), text: slotSampleText(slot, label) }));
  const defaultRootText = (label: string) =>
    component.slots.some((s) => s !== "root" && s !== "icon") ? "" : label;

  const usage = parseUsage(app, component.name);
  if (usage) {
    return renderInstance("usage", usage.props, usage.tag, usage.rootText, usage.children);
  }

  const firstVariant = component.variants[0];
  if (!firstVariant || firstVariant.values.length === 0) {
    return renderInstance(
      component.name,
      {},
      defaultTag,
      defaultRootText(clickMe),
      defaultChildren(clickMe),
    );
  }
  return (
    <>
      {firstVariant.values.map((value) =>
        renderInstance(
          value,
          { [firstVariant.name]: value },
          defaultTag,
          defaultRootText(clickMe),
          defaultChildren(clickMe),
        ),
      )}
    </>
  );
}

import type { CompileResult } from "@arviahq/compiler";
import type { FrameworkId } from "./frameworks";

/** Label strings for generated snippets — fbt-resolved on the main thread
 *  and shipped to the worker (fbt can't run there). */
export interface SnippetLabels {
  clickMe: string;
  sampleText: string;
}

type Meta = CompileResult["meta"];

/** Interactive-looking components preview as a button, everything else as a div. */
export function previewTagFor(css: string): "button" | "div" {
  return /cursor:\s*pointer/.test(css) ? "button" : "div";
}

export function slotSampleText(slot: string, label: string): string {
  if (slot === "icon") return "→";
  if (slot === "label") return label;
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

export function childTagFor(slot: string): string {
  return slot === "icon" || slot === "label" ? "span" : "div";
}

interface Usage {
  componentName: string;
  props: string;
  tag: string;
  rootText: string;
  children: { tag: string; slot: string; text: string }[];
}

function usageFor(meta: Meta, css: string, labels: SnippetLabels): Usage | null {
  const component = meta.components[0];
  if (!component) return null;

  const variant = component.variants[0];
  const props =
    variant && variant.values.length > 0
      ? `{ ${variant.name}: "${variant.values[variant.values.length - 1]}" }`
      : "";

  const childSlots = component.slots.filter((s) => s !== "root");
  return {
    componentName: component.name,
    props,
    tag: previewTagFor(css),
    rootText: childSlots.some((s) => s !== "icon") ? "" : labels.clickMe,
    children: childSlots.map((slot) => ({
      tag: childTagFor(slot),
      slot,
      text: slotSampleText(slot, labels.clickMe),
    })),
  };
}

/** Default app source per framework — a real, runnable module with a default
 *  export, regenerated from the compiled meta until the user edits it. */
export function defaultAppSource(
  framework: FrameworkId,
  meta: Meta,
  css: string,
  labels: SnippetLabels,
): string {
  const usage = usageFor(meta, css, labels);
  if (framework === "vue") return vueSnippet(usage, meta, labels);
  return tsxSnippet(usage, meta, labels);
}

function tsxSnippet(usage: Usage | null, meta: Meta, labels: SnippetLabels): string {
  if (!usage) {
    const style = meta.styles[0];
    if (!style) {
      return `// define a component or style to see its usage
export default function App() {
  return null;
}
`;
    }
    return `import { ${style.name} } from "./App.arv";

export default function App() {
  return <p className={${style.name}}>${labels.sampleText}</p>;
}
`;
  }

  const rootText = usage.rootText ? `\n      ${usage.rootText}` : "";
  const children = usage.children
    .map((c) => `\n      <${c.tag} className={styles.${c.slot}}>${c.text}</${c.tag}>`)
    .join("");

  return `import { ${usage.componentName} } from "./App.arv";

const styles = ${usage.componentName}(${usage.props});

export default function App() {
  return (
    <${usage.tag} className={styles.root}>${rootText}${children}
    </${usage.tag}>
  );
}
`;
}

function vueSnippet(usage: Usage | null, meta: Meta, labels: SnippetLabels): string {
  if (!usage) {
    const style = meta.styles[0];
    if (!style) {
      return `<script setup lang="ts">
// define a component or style to see its usage
</script>

<template>
  <span></span>
</template>
`;
    }
    return `<script setup lang="ts">
import { ${style.name} } from "./App.arv";
</script>

<template>
  <p :class="${style.name}">${labels.sampleText}</p>
</template>
`;
  }

  const rootText = usage.rootText ? `\n    ${usage.rootText}` : "";
  const children = usage.children
    .map((c) => `\n    <${c.tag} :class="styles.${c.slot}">${c.text}</${c.tag}>`)
    .join("");

  return `<script setup lang="ts">
import { ${usage.componentName} } from "./App.arv";

const styles = ${usage.componentName}(${usage.props});
</script>

<template>
  <${usage.tag} :class="styles.root">${rootText}${children}
  </${usage.tag}>
</template>
`;
}

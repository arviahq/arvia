import fs from "node:fs";
import path from "node:path";
import { compile, type ThemeEnv } from "@arviahq/compiler";

export interface StorybookGenerateOptions {
  /** Directory to scan for .arv files. */
  cwd: string;
  /** Output directory for generated stories (relative to cwd). */
  outDir?: string;
  /** Theme file path (absolute or relative to cwd). */
  theme?: string;
  /** When set, only scan these subdirectories of cwd (e.g. ["atoms", "language"]). */
  includeDirs?: string[];
}

export interface StorybookGenerateResult {
  files: string[];
  errors: string[];
}

interface ComponentMeta {
  name: string;
  slots: string[];
  variants: { name: string; values: string[] }[];
  defaults: Record<string, string>;
}

function relativeImport(from: string, to: string): string {
  let rel = path.relative(path.dirname(from), to).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel.replace(/\.arv$/, ".arv");
}

function toPascalCase(name: string): string {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function storyTitle(arviaPath: string, scanRoot: string, componentName: string): string {
  const rel = path.relative(scanRoot, arviaPath).replace(/\\/g, "/");
  const parts = rel.split("/");
  if (parts.length >= 2) {
    const folder = parts[0]!;
    if (folder === "src") {
      return `Arvia/${componentName}`;
    }
    const category = toPascalCase(folder);
    const base = path.basename(arviaPath, ".arv");
    return `${category}/${toPascalCase(base)}`;
  }
  return `Arvia/${componentName}`;
}

function emitRender(component: ComponentMeta): string {
  const slots = new Set(component.slots);
  const name = component.name;

  if (slots.has("root") && slots.has("icon") && slots.has("label")) {
    return `<button type="button" className={styles.root}>
      <span className={styles.icon}>✦</span>
      <span className={styles.label}>${name}</span>
    </button>`;
  }

  if (slots.has("header") && slots.has("body")) {
    const footer = slots.has("footer")
      ? `\n      <footer className={styles.footer}>Footer</footer>`
      : "";
    return `<div className={styles.root}>
      <header className={styles.header}>Header</header>
      <div className={styles.body}>Body content</div>${footer}
    </div>`;
  }

  if (slots.has("icon") && slots.has("title") && slots.has("message")) {
    return `<div className={styles.root} role="alert">
      <span className={styles.icon}>ℹ</span>
      <div>
        <div className={styles.title}>${name}</div>
        <div className={styles.message}>Supporting message text.</div>
      </div>
    </div>`;
  }

  if (slots.has("label") && slots.has("input") && slots.has("hint")) {
    return `<div className={styles.root}>
      <label className={styles.label}>Email</label>
      <input className={styles.input} placeholder="you@example.com" />
      <span className={styles.hint}>We never share your email.</span>
    </div>`;
  }

  if (slots.has("image") && slots.has("fallback")) {
    return `<div className={styles.root}>
      <span className={styles.fallback}>AB</span>
    </div>`;
  }

  if (slots.has("value") && slots.has("label")) {
    return `<div className={styles.root}>
      <div className={styles.value}>1,234</div>
      <div className={styles.label}>Active users</div>
    </div>`;
  }

  if (slots.has("brand") && slots.has("nav") && slots.has("actions")) {
    return `<header className={styles.root}>
      <div className={styles.brand}>Acme</div>
      <nav className={styles.nav}>Home · Docs · Blog</nav>
      <div className={styles.actions}>Actions</div>
    </header>`;
  }

  if (slots.has("media") && slots.has("content") && slots.has("title")) {
    return `<article className={styles.root}>
      <div className={styles.media}>📦</div>
      <div className={styles.content}>
        <div className={styles.title}>Product name</div>
        <div className={styles.price}>$49</div>
        <div className={styles.meta}>Badge area</div>
        <div className={styles.actions}>CTA</div>
      </div>
    </article>`;
  }

  if (slots.has("item") && slots.has("icon") && slots.has("title") && slots.has("description")) {
    return `<div className={styles.root}>
      <div className={styles.item}>
        <div className={styles.icon}>⚡</div>
        <div className={styles.title}>Fast</div>
        <div className={styles.description}>Build-time compilation.</div>
      </div>
    </div>`;
  }

  if (slots.has("main") && slots.has("footer")) {
    const sidebar = slots.has("sidebar")
      ? `\n      <aside className={styles.sidebar}>Sidebar</aside>`
      : "";
    return `<div className={styles.root}>
      <header className={styles.header}>Header</header>${sidebar}
      <main className={styles.main}>Main content</main>
      <footer className={styles.footer}>Footer</footer>
    </div>`;
  }

  if (slots.has("sidebar") && slots.has("content")) {
    return `<div className={styles.root}>
      <aside className={styles.sidebar}>Sidebar</aside>
      <main className={styles.content}>Dashboard content</main>
    </div>`;
  }

  if (name === "Input") {
    return `<input className={styles.root} placeholder="Placeholder text" />`;
  }

  if (name === "Link") {
    return `<a className={styles.root} href="#">${name}</a>`;
  }

  if (name === "Divider") {
    return `<hr className={styles.root} />`;
  }

  if (name === "Badge" || (slots.size <= 1 && slots.has("root"))) {
    return `<span className={styles.root}>${name}</span>`;
  }

  if (slots.has("icon") && slots.has("label")) {
    return `<button type="button" className={styles.root}>
      <span className={styles.icon}>★</span>
      <span className={styles.label}>${name}</span>
    </button>`;
  }

  const rootSlot = slots.has("root") ? "root" : (component.slots[0] ?? "root");
  const labelSlot = slots.has("label") ? "label" : rootSlot;
  return `<div className={styles.${rootSlot}}><span className={styles.${labelSlot}}>${name}</span></div>`;
}

function emitStory(
  component: ComponentMeta,
  arviaPath: string,
  outPath: string,
  scanRoot: string,
): string {
  const importPath = relativeImport(outPath, arviaPath);
  const title = storyTitle(arviaPath, scanRoot, component.name);
  const renderBody = emitRender(component);
  const hasVariants = component.variants.length > 0;
  const callExpr = hasVariants ? `${component.name}(props)` : `${component.name}()`;

  const argTypes = component.variants
    .map((v) => {
      const options = v.values.map((val) => JSON.stringify(val)).join(", ");
      return `    ${JSON.stringify(v.name)}: { control: "select", options: [${options}] },`;
    })
    .join("\n");

  const defaultArgs = Object.entries(component.defaults)
    .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join("\n");

  const variantMatrix = component.variants
    .map((variant) => {
      return variant.values
        .map((value) => {
          const args = Object.entries(component.defaults)
            .map(([k, v]) => [k, k === variant.name ? value : v] as const)
            .map(([k, v]) => `      ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
            .join("\n");
          return `export const ${variant.name}_${value} = {
  args: {
${args}
  },
};`;
        })
        .join("\n\n");
    })
    .join("\n\n");

  return `// Generated by @arviahq/storybook — do not edit.
import { ${component.name} } from ${JSON.stringify(importPath)};

export default {
  title: ${JSON.stringify(title)},
  render: ${hasVariants ? "(props: Record<string, unknown>)" : "()"} => {
    const styles = ${callExpr};
    return (
      ${renderBody}
    );
  },
${argTypes ? `  argTypes: {\n${argTypes}\n  },` : ""}
};

export const Playground = {
  args: {
${defaultArgs || "    // no defaults"}
  },
};

${variantMatrix}
`;
}

function emitStyleStory(
  styleName: string,
  arviaPath: string,
  outPath: string,
  scanRoot: string,
): string {
  const importPath = relativeImport(outPath, arviaPath);
  const title = storyTitle(arviaPath, scanRoot, styleName);

  return `// Generated by @arviahq/storybook — do not edit.
import { ${styleName} } from ${JSON.stringify(importPath)};

export default {
  title: ${JSON.stringify(title)},
  render: () => (
    <p className={${styleName}}>
      Long text that demonstrates truncation when the container is narrow.
    </p>
  ),
};

export const Playground = {};
`;
}

export async function generateStorybook(
  options: StorybookGenerateOptions,
): Promise<StorybookGenerateResult> {
  const cwd = path.resolve(options.cwd);
  const outDir = path.resolve(cwd, options.outDir ?? "stories/generated");
  const errors: string[] = [];
  const files: string[] = [];

  const arvFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".arv")) arvFiles.push(full);
    }
  };

  if (options.includeDirs?.length) {
    for (const sub of options.includeDirs) {
      const dir = path.join(cwd, sub);
      if (fs.existsSync(dir)) walk(dir);
    }
  } else {
    walk(cwd);
  }

  const themePath = options.theme
    ? path.resolve(options.theme)
    : arvFiles.find((f) => path.basename(f) === "theme.arv");

  let env: ThemeEnv | undefined;
  if (themePath && fs.existsSync(themePath)) {
    const themeResult = compile(fs.readFileSync(themePath, "utf8"), {
      filename: themePath,
      root: cwd,
    });
    for (const d of themeResult.diagnostics) {
      if (d.severity === "error") errors.push(`${themePath}: ${d.message}`);
    }
    env = themeResult.env;
  }

  fs.mkdirSync(outDir, { recursive: true });

  for (const arviaPath of arvFiles) {
    if (arviaPath === themePath) continue;
    const source = fs.readFileSync(arviaPath, "utf8");
    const result = compile(source, { filename: arviaPath, env, root: cwd });
    let fileFailed = false;
    for (const d of result.diagnostics) {
      if (d.severity === "error") {
        errors.push(`${arviaPath}: ${d.message}`);
        fileFailed = true;
      }
    }
    if (fileFailed) continue;

    const relDir = path.relative(cwd, path.dirname(arviaPath));
    const storySubdir = relDir && relDir !== "." ? path.join(outDir, relDir) : outDir;
    fs.mkdirSync(storySubdir, { recursive: true });

    for (const component of result.meta.components) {
      const base = path.basename(arviaPath, ".arv");
      const storyName = result.meta.components.length > 1 ? `${base}-${component.name}` : base;
      const outPath = path.join(storySubdir, `${storyName}.stories.tsx`);
      const content = emitStory(component, arviaPath, outPath, cwd);
      fs.writeFileSync(outPath, content);
      files.push(outPath);
    }

    for (const style of result.meta.styles) {
      const base = path.basename(arviaPath, ".arv");
      const outPath = path.join(storySubdir, `${base}-${style.name}.stories.tsx`);
      const content = emitStyleStory(style.name, arviaPath, outPath, cwd);
      fs.writeFileSync(outPath, content);
      files.push(outPath);
    }
  }

  return { files, errors };
}

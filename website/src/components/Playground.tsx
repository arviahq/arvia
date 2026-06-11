import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { compile, LineIndex, type CompileResult } from "@arviahq/compiler";
import { CodeBlock } from "./code-block.arv";
import { Playground as PlaygroundStyles } from "./playground.arv";
import { highlightCode } from "./highlight";
import { useSiteTheme } from "../site-theme";
import type { ArviaMarker } from "./MonacoArvia";

// Monaco is heavy — load it only when the playground renders.
const MonacoArvia = lazy(() => import("./MonacoArvia"));

const DEFAULT_SOURCE = `theme {
  color {
    primary = #6358ff;
    primaryHover = #5249e6;
  }
  radius { md = 10px; }
}

component Button {
  slots { root {} icon {} }

  base {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: none;
    cursor: pointer;
    padding: 10px 18px;
    border-radius: radius.md;
    background: color.primary;
    color: white;
    font-weight: 600;
    transition: all 150ms ease;

    &:hover {
      background: color.primaryHover;
      icon { transform: translateX(3px); }
    }
  }

  variants {
    size {
      sm { font-size: 13px; }
      lg { font-size: 17px; padding: 14px 24px; }
    }
  }

  defaults { size: sm; }
}
`;

type OutputTab = "preview" | "css" | "types";
type EditorFile = "arv" | "tsx";

interface LastGood {
  css: string;
  dts: string;
  meta: CompileResult["meta"];
}

export function Playground() {
  const pg = PlaygroundStyles();
  const editorBlock = CodeBlock();
  const outputBlock = CodeBlock();
  const siteTheme = useSiteTheme();

  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [file, setFile] = useState<EditorFile>("arv");
  const [editedTsx, setEditedTsx] = useState<string | null>(null);
  const [tab, setTab] = useState<OutputTab>("preview");
  const [outputHtml, setOutputHtml] = useState<string | null>(null);

  // Compile in the browser on every edit — the same compiler that runs in Vite.
  const result = useMemo(() => compile(source, { filename: "playground.arv" }), [source]);
  const lastGood = useRef<LastGood>({ css: "", dts: "", meta: { ...emptyMeta } });
  if (result.css !== null) {
    lastGood.current = { css: result.css, dts: result.dts ?? "", meta: result.meta };
  }
  const { css, dts, meta } = lastGood.current;
  const errors = result.diagnostics.filter((d) => d.severity === "error");

  // App.tsx follows the compiled component until the user edits it by hand.
  const tsx = editedTsx ?? usageSnippet(meta);

  useEffect(() => {
    if (tab === "preview") return;
    const code = tab === "css" ? css : dts;
    let cancelled = false;
    highlightCode(code || "/* empty */", tab === "css" ? "css" : "tsx", siteTheme)
      .then((html) => {
        if (!cancelled) setOutputHtml(html);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [tab, css, dts, siteTheme]);

  // Compiler diagnostics become real editor squiggles.
  const markers = useMemo<ArviaMarker[]>(() => {
    const index = new LineIndex(source);
    return errors.map((d) => {
      const range = index.spanToRange(d.span);
      return {
        startLineNumber: range.start.line,
        startColumn: range.start.col,
        endLineNumber: range.end.line,
        endColumn: range.end.col,
        message: d.hint ? `${d.message} (${d.hint})` : d.message,
      };
    });
  }, [source, errors]);

  useEffect(() => {
    let cancelled = false;
    import("./MonacoArvia").then((mod) => {
      if (!cancelled) mod.setMarkersOnCurrentModels(markers);
    });
    return () => {
      cancelled = true;
    };
  }, [markers]);

  const dotsOf = (block: ReturnType<typeof CodeBlock>) => (
    <span className={block.dots} aria-hidden>
      <span className={block.dotRed} />
      <span className={block.dotAmber} />
      <span className={block.dotGreen} />
    </span>
  );

  return (
    <div className={pg.root}>
      <div className={editorBlock.root} style={{ margin: 0 }}>
        <div className={editorBlock.header}>
          {dotsOf(editorBlock)}
          <span className={pg.tabs} style={{ marginLeft: 0 }}>
            {(
              [
                ["arv", "playground.arv"],
                ["tsx", "App.tsx"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={pg.tab}
                data-active={file === id}
                onClick={() => setFile(id)}
              >
                {label}
              </button>
            ))}
          </span>
          <span style={{ marginLeft: "auto", fontWeight: 500 }}>editable</span>
        </div>
        <div className={editorBlock.body} style={{ overflow: "hidden" }}>
          <div className={pg.editor}>
            <Suspense
              fallback={
                <pre style={{ margin: 0, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
                  {file === "arv" ? source : tsx}
                </pre>
              }
            >
              <MonacoArvia
                path={file === "arv" ? "playground.arv" : "App.tsx"}
                language={file === "arv" ? "arvia" : "typescript"}
                value={file === "arv" ? source : tsx}
                onChange={file === "arv" ? setSource : setEditedTsx}
                theme={siteTheme}
                markers={markers}
                height={300}
              />
            </Suspense>
          </div>
        </div>
        {errors.length > 0 ? (
          <ul className={pg.diagnostics}>
            {errors.slice(0, 3).map((d, i) => (
              <li key={i}>
                {d.line}:{d.col} {d.code} — {d.message}
                {d.hint ? ` (${d.hint})` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={outputBlock.root} style={{ margin: 0 }}>
        <div className={outputBlock.header}>
          {dotsOf(outputBlock)}
          output
          <span className={pg.tabs}>
            {(["preview", "css", "types"] as const).map((name) => (
              <button
                key={name}
                type="button"
                className={pg.tab}
                data-active={tab === name}
                onClick={() => setTab(name)}
              >
                {name}
              </button>
            ))}
          </span>
        </div>
        {tab === "preview" ? (
          <div className={pg.preview}>
            <style>{css}</style>
            <LivePreview meta={meta} tsx={tsx} />
          </div>
        ) : (
          <div className={outputBlock.body} style={{ margin: 0 }}>
            <div className={pg.output}>
              {outputHtml ? (
                <div dangerouslySetInnerHTML={{ __html: outputHtml }} />
              ) : (
                <pre style={{ margin: 0, padding: 16 }}>{tab === "css" ? css : dts}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** How you'd consume the compiled component from React. */
function usageSnippet(meta: CompileResult["meta"]): string {
  const component = meta.components[0];
  if (!component) {
    const style = meta.styles[0];
    if (!style) return "// define a component or style to see its usage";
    return `import { ${style.name} } from "./playground.arv";

<p className={${style.name}}>Hello</p>;
`;
  }

  const variant = component.variants[0];
  const props =
    variant && variant.values.length > 0
      ? `{ ${variant.name}: "${variant.values[variant.values.length - 1]}" }`
      : "";
  const icon = component.slots.includes("icon") ? `\n  <span className={styles.icon}>→</span>` : "";

  return `import { ${component.name} } from "./playground.arv";

const styles = ${component.name}(${props});

<button className={styles.root}>
  Click me${icon}
</button>;
`;
}

const emptyMeta: CompileResult["meta"] = {
  components: [],
  tokens: [],
  keyframes: [],
  styles: [],
};

interface TsxUsage {
  props: Record<string, string>;
  label: string;
  showIcon: boolean;
}

/** Best-effort read of the App.tsx usage: variant props, button label, icon slot. */
function parseUsage(tsx: string, componentName: string): TsxUsage | null {
  const call = tsx.match(new RegExp(`\\b${componentName}\\s*\\(([^)]*)\\)`));
  if (!call) return null;

  const props: Record<string, string> = {};
  for (const m of (call[1] ?? "").matchAll(/([A-Za-z_$][\w$]*)\s*:\s*["']([^"']*)["']/g)) {
    props[m[1] ?? ""] = m[2] ?? "";
  }

  let label = componentName;
  const jsx = tsx.match(/<([a-zA-Z][\w]*)\b[^>]*>([\s\S]*?)<\/\1>/);
  if (jsx?.[2] != null) {
    const text = jsx[2]
      .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, " ")
      .replace(/<[^>]*\/>/g, " ")
      .replace(/\{[^}]*\}/g, " ")
      .trim();
    if (text) label = text;
  }

  return { props, label, showIcon: /styles\.icon/.test(tsx) };
}

/** Renders what App.tsx describes; falls back to one button per first-variant value. */
function LivePreview({ meta, tsx }: { meta: CompileResult["meta"]; tsx: string }) {
  const component = meta.components[0];
  if (!component) {
    return <span style={{ opacity: 0.6, fontSize: 13 }}>define a component to preview it</span>;
  }

  const classFor = (overrides: Record<string, string>): string => {
    const classes = [`${component.name}_root_${component.hash}`];
    for (const variant of component.variants) {
      const override = overrides[variant.name];
      const value =
        override && variant.values.includes(override)
          ? override
          : component.defaults[variant.name];
      if (value) {
        classes.push(`${component.name}_${variant.name}_${value}_root_${component.hash}`);
      }
    }
    return classes.join(" ");
  };

  const hasIcon = component.slots.includes("icon");
  const renderOne = (label: string, overrides: Record<string, string>, withIcon = hasIcon) => (
    <button key={label} type="button" className={classFor(overrides)}>
      {label}
      {withIcon ? (
        <span className={`${component.name}_icon_${component.hash}`} aria-hidden>
          →
        </span>
      ) : null}
    </button>
  );

  const usage = parseUsage(tsx, component.name);
  if (usage) {
    return renderOne(usage.label, usage.props, hasIcon && usage.showIcon);
  }

  const firstVariant = component.variants[0];
  if (!firstVariant || firstVariant.values.length === 0) {
    return renderOne(component.name, {});
  }
  return (
    <>{firstVariant.values.map((value) => renderOne(value, { [firstVariant.name]: value }))}</>
  );
}

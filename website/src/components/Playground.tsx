import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LineIndex, type CompileResult, type ThemeEnv } from "@arviahq/compiler";
import { headingText } from "../lib/render-prose";
import { CodeBlock } from "./code-block.arv";
import { Playground as PlaygroundStyles } from "./playground.arv";
import { tokens } from "../theme.arv";
import { highlightCode } from "./highlight";
import { useSiteTheme } from "../site-theme";
import type { ArviaMarker } from "./MonacoArvia";
import { SyntheticPreview } from "../playground/runtime/SyntheticPreview";
import { BuildClient, type BuildResponse } from "../playground/runtime/worker-client";

// Monaco is heavy — load it only when the playground renders.
const MonacoArvia = lazy(() => import("./MonacoArvia"));

export const DEFAULT_SOURCE = `theme {
  color {
    primary = #6358ff;
    primaryHover = #5249e6;
  }
  radius { md = 10px; }
}

component Button {
  slots {
    icon { flex-shrink: 0; transition: transform 150ms ease; }
  }

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

export interface PlaygroundTemplate {
  id: string;
  label: ReactNode;
  source: string;
}

export interface PlaygroundTemplateGroup {
  label: ReactNode;
  items: PlaygroundTemplate[];
}

interface LastGood {
  css: string;
  dts: string;
  meta: CompileResult["meta"];
}

/** Compact two-pane playground with a synthetic (in-host) preview — used on
 *  the homepage. The full IDE with real code execution is `PlaygroundIDE`. */
export function Playground(
  props: {
    /** Pane height in px — editor, output, and preview all match. */
    height?: number;
    /** Theme environment so sources can reference site tokens (color.*, space.*…). */
    env?: ThemeEnv;
    /** CSS compiled alongside `env` — injected into the preview so hashed names (keyframes) resolve. */
    baseCss?: string;
    /** When set, a template select replaces the "editable" header label. */
    templates?: PlaygroundTemplateGroup[];
    /** Initial editor source (e.g. a snippet shared via URL); overrides templates. */
    initialSource?: string;
  } = {},
) {
  const pg = PlaygroundStyles();
  const editorBlock = CodeBlock();
  const outputBlock = CodeBlock();
  const siteTheme = useSiteTheme();
  const height = props.height ?? 300;
  const outputTabs = [
    { id: "preview" as const, label: <fbt desc="Playground output tab label">{"preview"}</fbt> },
    { id: "css" as const, label: <fbt desc="Playground output tab label">{"css"}</fbt> },
    { id: "types" as const, label: <fbt desc="Playground output tab label">{"types"}</fbt> },
  ];
  const clickMe = headingText(<fbt desc="Playground preview button label">{"Click me"}</fbt>);
  const sampleText = headingText(
    <fbt desc="Playground preview placeholder text">
      {"The quick brown fox jumps over the lazy dog"}
    </fbt>,
  );
  const emptyPreviewHint = headingText(
    <fbt desc="Playground empty preview hint">{"define a component or style to preview it"}</fbt>,
  );

  const firstTemplate = props.templates?.[0]?.items[0];
  const [source, setSource] = useState(
    props.initialSource ?? firstTemplate?.source ?? DEFAULT_SOURCE,
  );
  const [templateId, setTemplateId] = useState(
    props.initialSource ? "" : (firstTemplate?.id ?? ""),
  );
  const [file, setFile] = useState<EditorFile>("arv");
  const [editedTsx, setEditedTsx] = useState<string | null>(null);
  const [tab, setTab] = useState<OutputTab>("preview");
  const [outputHtml, setOutputHtml] = useState<string | null>(null);
  const [build, setBuild] = useState<BuildResponse | null>(null);

  function selectTemplate(id: string) {
    const template = (props.templates ?? []).flatMap((g) => g.items).find((t) => t.id === id);
    if (!template) return;
    setTemplateId(id);
    setSource(template.source);
    setEditedTsx(null);
    setFile("arv");
  }

  // Compilation runs in a worker — the same compiler that runs in Vite.
  const clientRef = useRef<BuildClient | null>(null);
  useEffect(() => {
    const client = new BuildClient(setBuild);
    clientRef.current = client;
    return () => {
      client.dispose();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    clientRef.current?.request({
      framework: "react",
      arvSource: source,
      appSource: editedTsx,
      labels: { clickMe, sampleText },
      env: props.env,
    });
  }, [source, editedTsx, props.env, clickMe, sampleText]);

  const lastGood = useRef<LastGood>({ css: "", dts: "", meta: { ...emptyMeta } });
  if (build && build.css !== null) {
    lastGood.current = { css: build.css, dts: build.dts ?? "", meta: build.meta };
  }
  const { css, dts, meta } = lastGood.current;
  const errors = (build?.diagnostics ?? []).filter((d) => d.severity === "error");

  // App.tsx follows the compiled component until the user edits it by hand.
  const tsx = editedTsx ?? build?.appSource ?? "";

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
                ["arv", "App.arv"],
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
          {props.templates ? (
            <select
              value={templateId}
              onChange={(e) => selectTemplate(e.target.value)}
              style={{
                marginLeft: "auto",
                padding: "2px 8px",
                borderRadius: 6,
                border: `1px solid ${tokens.color.border}`,
                background: tokens.color.surface,
                color: tokens.color.text,
                fontFamily: "inherit",
                fontSize: 12,
              }}
            >
              {props.initialSource ? (
                <option value="">
                  <fbt desc="Playground template select — snippet loaded from URL">
                    {"shared snippet"}
                  </fbt>
                </option>
              ) : null}
              {props.templates.map((group) => (
                <optgroup key={headingText(group.label)} label={headingText(group.label)}>
                  {group.items.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <span style={{ marginLeft: "auto", fontWeight: 500 }}>
              <fbt desc="Playground editor header label">{"editable"}</fbt>
            </span>
          )}
        </div>
        <div className={editorBlock.body} style={{ overflow: "hidden" }}>
          <div className={pg.editor} style={{ height }}>
            <Suspense
              fallback={
                <pre style={{ margin: 0, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
                  {file === "arv" ? source : tsx}
                </pre>
              }
            >
              <MonacoArvia
                path={file === "arv" ? "App.arv" : "App.tsx"}
                language={file === "arv" ? "arvia" : "typescript"}
                value={file === "arv" ? source : tsx}
                onChange={file === "arv" ? setSource : setEditedTsx}
                theme={siteTheme}
                markers={markers}
                height={height}
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
          <fbt desc="Playground output pane header">{"output"}</fbt>
          <span className={pg.tabs}>
            {outputTabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={pg.tab}
                data-active={tab === id}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </span>
        </div>
        {tab === "preview" ? (
          <div className={pg.preview} style={{ height }}>
            <style>{props.baseCss ? `${props.baseCss}\n${css}` : css}</style>
            <SyntheticPreview
              meta={meta}
              app={tsx}
              css={css}
              sampleText={sampleText}
              emptyHint={emptyPreviewHint}
              clickMe={clickMe}
            />
          </div>
        ) : (
          <div className={outputBlock.body} style={{ margin: 0 }}>
            <div className={pg.output} style={{ height }}>
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

const emptyMeta: CompileResult["meta"] = {
  components: [],
  tokens: [],
  keyframes: [],
  styles: [],
};

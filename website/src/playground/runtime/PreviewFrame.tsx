import { useEffect, useMemo, useRef, useState } from "react";
import type { FrameworkId } from "./frameworks";
import { buildSrcdoc, type PreviewMessage, type PreviewUpdate } from "./srcdoc";

interface ConsoleLine {
  level: "log" | "info" | "warn" | "error";
  text: string;
}

/** Sandboxed live preview: executes the transpiled app for real. The iframe
 *  is `allow-scripts` only (opaque origin) — user code never runs on our origin. */
export function PreviewFrame(props: {
  framework: FrameworkId;
  css: string;
  designJs: string;
  appJs: string;
  /** Transpile error from the worker — shown in the same overlay as runtime errors. */
  buildError: string | null;
  theme: "light" | "dark";
  height: number;
  /** Bump to force a full iframe reload (fresh document, app state reset). */
  reloadToken?: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const latestRef = useRef<PreviewUpdate | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [logs, setLogs] = useState<ConsoleLine[]>([]);

  // Import maps can't change after first resolution — a framework switch
  // swaps the srcdoc, which remounts the iframe via `key` below.
  const srcdoc = useMemo(() => buildSrcdoc(props.framework), [props.framework]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      const msg = event.data as PreviewMessage;
      if (msg.type === "ready") {
        readyRef.current = true;
        if (latestRef.current) {
          iframeRef.current?.contentWindow?.postMessage(latestRef.current, "*");
        }
      } else if (msg.type === "ok") {
        setRuntimeError(null);
      } else if (msg.type === "error") {
        setRuntimeError(msg.message);
      } else if (msg.type === "console") {
        setLogs((lines) => [...lines.slice(-49), { level: msg.level, text: msg.text }]);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    readyRef.current = false;
    setRuntimeError(null);
    setLogs([]);
  }, [srcdoc, props.reloadToken]);

  useEffect(() => {
    const update: PreviewUpdate = {
      type: "update",
      css: props.css,
      designJs: props.designJs,
      appJs: props.appJs,
      theme: props.theme,
    };
    latestRef.current = update;
    if (readyRef.current) {
      iframeRef.current?.contentWindow?.postMessage(update, "*");
    }
  }, [props.css, props.designJs, props.appJs, props.theme, srcdoc]);

  const error = props.buildError ?? runtimeError;

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      <iframe
        key={`${props.framework}:${props.reloadToken ?? 0}`}
        ref={iframeRef}
        title="preview"
        sandbox="allow-scripts"
        srcDoc={srcdoc}
        style={{ border: "none", width: "100%", flex: 1, minHeight: 0 }}
      />
      {logs.length > 0 ? (
        <pre
          style={{
            margin: 0,
            maxHeight: Math.min(96, props.height / 4),
            overflow: "auto",
            padding: "6px 10px",
            fontSize: 12,
            lineHeight: 1.5,
            borderTop: "1px solid rgba(125, 125, 125, 0.25)",
            opacity: 0.85,
          }}
        >
          {logs.map((line, i) => (
            <div key={i} style={line.level === "error" ? { color: "#f85149" } : undefined}>
              {line.text}
            </div>
          ))}
        </pre>
      ) : null}
      {error ? (
        <pre
          style={{
            position: "absolute",
            inset: 0,
            margin: 0,
            padding: 16,
            overflow: "auto",
            fontSize: 12.5,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            color: "#f85149",
            background: "rgba(20, 8, 8, 0.92)",
          }}
        >
          {error}
        </pre>
      ) : null}
    </div>
  );
}

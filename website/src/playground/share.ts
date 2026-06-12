/** URL-safe encoding for sharing playground sources.
 *  v1: #code=<base64url(arv source)> — emitted by docs links, react-only.
 *  v2: #s=<base64url(JSON)> — carries the framework and an edited app file. */

import type { FrameworkId } from "./runtime/frameworks";

export interface SharedSnippet {
  source: string;
  framework: FrameworkId;
  /** App-file source when the user edited it; null → generated default. */
  app: string | null;
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string | null {
  try {
    const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeShareCode(source: string): string {
  return toBase64Url(source);
}

/** TanStack Router's `location.hash` has no leading `#`; `window.location.hash` does. */
function normalizeHash(hash: string): string {
  return hash.startsWith("#") ? hash : `#${hash}`;
}

export function decodeShareCode(hash: string): string | null {
  const match = /#code=([A-Za-z0-9_-]+)/.exec(normalizeHash(hash));
  return match ? fromBase64Url(match[1]!) : null;
}

const FRAMEWORK_IDS: FrameworkId[] = ["react", "preact", "vue"];

export function encodeShared(snippet: SharedSnippet): string {
  // Keep the v1 format when it can express the snippet — existing links and
  // the docs' `playgroundHref` stay one canonical shape.
  if (snippet.framework === "react" && snippet.app === null) {
    return `#code=${encodeShareCode(snippet.source)}`;
  }
  const payload: Record<string, unknown> = { v: 2, fw: snippet.framework, arv: snippet.source };
  if (snippet.app !== null) payload.app = snippet.app;
  return `#s=${toBase64Url(JSON.stringify(payload))}`;
}

export function decodeShared(hash: string): SharedSnippet | null {
  const v2 = /#s=([A-Za-z0-9_-]+)/.exec(normalizeHash(hash));
  if (v2) {
    const json = fromBase64Url(v2[1]!);
    if (json === null) return null;
    try {
      const payload = JSON.parse(json) as { fw?: string; arv?: string; app?: string };
      if (typeof payload.arv !== "string") return null;
      const framework = FRAMEWORK_IDS.find((id) => id === payload.fw) ?? "react";
      return {
        source: payload.arv,
        framework,
        app: typeof payload.app === "string" ? payload.app : null,
      };
    } catch {
      return null;
    }
  }
  const v1 = decodeShareCode(hash);
  return v1 === null ? null : { source: v1, framework: "react", app: null };
}

export function playgroundHref(source: string): string {
  return `/playground#code=${encodeShareCode(source)}`;
}

/** Matches the doc-example heuristic: only complete .arv files open in the
 *  playground; fragments (a lone variants/compound block…) would not compile. */
export function isCompleteArvFile(code: string): boolean {
  return /^\s*(\/\/.*\n\s*)*(theme|component|recipe|global|keyframes|style)\b/.test(code);
}

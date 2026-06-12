/** URL-safe encoding for sharing playground sources: #code=<base64url(utf8)>. */

export function encodeShareCode(source: string): string {
  const bytes = new TextEncoder().encode(source);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function decodeShareCode(hash: string): string | null {
  const match = /#code=([A-Za-z0-9_-]+)/.exec(hash);
  if (!match) return null;
  try {
    const base64 = match[1]!.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function playgroundHref(source: string): string {
  return `/playground#code=${encodeShareCode(source)}`;
}

/** Matches the doc-example heuristic: only complete .arv files open in the
 *  playground; fragments (a lone variants/compound block…) would not compile. */
export function isCompleteArvFile(code: string): boolean {
  return /^\s*(\/\/.*\n\s*)*(theme|component|recipe|global|keyframes|style)\b/.test(code);
}

import type { RawValue, ValueWord } from "./ast/nodes.js";
import { cssVarName, type ThemeEnv } from "./ir/ir.js";

export type RefWord = Extract<ValueWord, { kind: "ref" }>;

function resolveTokenLiteral(
  group: string,
  name: string,
  tokens: ThemeEnv["tokens"],
  mode: string | null,
  modes: string[] | null,
  onUnknownToken?: (word: RefWord) => void,
  word?: RefWord,
): string | undefined {
  const bucket = tokens[group];
  if (!bucket) return undefined;
  const entry = bucket[name];
  if (entry === undefined) {
    if (word) onUnknownToken?.(word);
    return undefined;
  }
  if (typeof entry === "string") return entry;
  const key = mode ?? modes?.[0];
  return (key && entry[key]) ?? entry[modes?.[0] ?? ""] ?? Object.values(entry)[0];
}

/** Component-scoped tokens: group → name → literal value. */
export type LocalTokens = Record<string, Record<string, string>>;

/**
 * Returns the value text with theme token refs replaced by their values.
 * When `modes` is set, known token refs become `var(--arvia-<group>-<name>)`.
 * `localTokens` (component-scoped) shadow theme tokens and always inline to
 * literals — they are compile-time constants, never CSS variables.
 */
export function substituteRefs(
  value: RawValue,
  env: Pick<ThemeEnv, "tokens" | "modes">,
  onUnknownToken?: (word: RefWord) => void,
  localTokens?: LocalTokens | null,
): string {
  const refs = value.words
    .filter((word): word is RefWord => word.kind === "ref")
    .toSorted((a, b) => b.span.start - a.span.start);

  let text = value.text;
  for (const word of refs) {
    let resolved: string | undefined;
    const local = localTokens?.[word.group]?.[word.name];
    if (local !== undefined) {
      resolved = local;
    } else if (env.modes) {
      const bucket = env.tokens[word.group];
      if (bucket && bucket[word.name] !== undefined) {
        resolved = `var(${cssVarName(word.group, word.name)})`;
      } else {
        onUnknownToken?.(word);
      }
    } else {
      resolved = resolveTokenLiteral(
        word.group,
        word.name,
        env.tokens,
        null,
        null,
        onUnknownToken,
        word,
      );
    }
    if (resolved === undefined) continue;
    const offset = word.span.start - value.span.start;
    text = text.slice(0, offset) + resolved + text.slice(offset + word.text.length);
  }
  return text;
}

/** Inlines token refs to literal values for a specific theme mode (CSS var definitions). */
export function substituteRefsForMode(
  value: RawValue,
  tokens: ThemeEnv["tokens"],
  mode: string,
  modes: string[] | null,
  onUnknownToken?: (word: RefWord) => void,
): string {
  const refs = value.words
    .filter((word): word is RefWord => word.kind === "ref")
    .toSorted((a, b) => b.span.start - a.span.start);

  let text = value.text;
  for (const word of refs) {
    const resolved = resolveTokenLiteral(
      word.group,
      word.name,
      tokens,
      mode,
      modes,
      onUnknownToken,
      word,
    );
    if (resolved === undefined) continue;
    const offset = word.span.start - value.span.start;
    text = text.slice(0, offset) + resolved + text.slice(offset + word.text.length);
  }
  return text;
}

/**
 * Inlines token refs inside an at-rule prelude to their LITERAL value. Media
 * and container conditions can't use `var()`, so even in a moded theme this
 * inlines the default-mode literal (never a `var()` reference). Non-ref text
 * passes through unchanged.
 */
export function substitutePreludeRefs(
  value: RawValue,
  env: Pick<ThemeEnv, "tokens" | "modes">,
  onUnknownToken?: (word: RefWord) => void,
): string {
  if (env.modes) {
    return substituteRefsForMode(value, env.tokens, env.modes[0]!, env.modes, onUnknownToken);
  }
  return substituteRefs(value, { tokens: env.tokens, modes: null }, onUnknownToken);
}

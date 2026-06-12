import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { InlineCode, proseLink } from "./layout.arv";

/** `code` spans and [text](/docs/slug) links inside docs prose. */
const INLINE_RE = /`([^`]+)`|\[([^\]]+)\]\((\/[^()\s]+)\)/g;

/** Renders docs prose, turning `backtick` spans into inline code and
 *  [text](/path) into router links. Plain strings pass through untouched. */
export function renderInline(value: string): ReactNode {
  const text = String(value);
  if (!text.includes("`") && !text.includes("](")) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(INLINE_RE)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      nodes.push(text.slice(cursor, index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <code key={index} className={InlineCode().root}>
          {match[1]}
        </code>,
      );
    } else {
      nodes.push(
        <Link key={index} className={proseLink} to={match[3]!}>
          {match[2]}
        </Link>,
      );
    }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

/** Stable anchor ids for docs headings, shared by DocContent and the TOC. */
export function headingId(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

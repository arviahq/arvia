import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { InlineCode, proseLink } from "../components/layout.arv";
import { appLink } from "./router-links";

/** `code` spans and [text](/docs/slug) or [text](https://…) links inside docs prose. */
const INLINE_RE = /`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^()\s]+|\/[^()\s]+)\)/g;

/** Renders docs prose with inline code and links. Plain strings pass through untouched. */
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
      const href = match[3]!;
      if (href.startsWith("http")) {
        nodes.push(
          <a
            key={index}
            className={proseLink}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {match[2]}
          </a>,
        );
      } else {
        nodes.push(
          <Link key={index} className={proseLink} {...appLink(href)}>
            {match[2]}
          </Link>,
        );
      }
    }
    cursor = index + match[0].length;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
}

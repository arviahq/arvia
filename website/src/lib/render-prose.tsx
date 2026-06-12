import { Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderInline } from "./render-inline";

type FbtResultLike = {
  getContents: () => unknown[];
  toString: () => string;
  flattenToArray?: () => unknown[];
};

function isFbtResult(value: unknown): value is FbtResultLike {
  return Boolean(value && typeof value === "object" && "getContents" in value);
}

function renderInlineIfNeeded(text: string): ReactNode {
  return text.includes("`") || text.includes("](") ? renderInline(text) : text;
}

function renderProseParts(parts: unknown[]): ReactNode {
  return parts.map((part, index) => {
    if (typeof part === "string") {
      return <Fragment key={index}>{renderInlineIfNeeded(part)}</Fragment>;
    }
    if (Array.isArray(part)) {
      return <Fragment key={index}>{renderProseParts(part)}</Fragment>;
    }
    if (isFbtResult(part)) {
      return <Fragment key={index}>{renderProseParts(part.getContents())}</Fragment>;
    }
    return <Fragment key={index}>{part as ReactNode}</Fragment>;
  });
}

/** Plain text for headings/TOC, search, and document.title — unwraps fbt and JSX. */
export function headingText(children: ReactNode): string {
  if (children == null || typeof children === "boolean") return "";
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (isFbtResult(children)) return children.toString();
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (isValidElement(children)) {
    return headingText((children as ReactElement<{ children?: ReactNode }>).props.children);
  }
  return String(children);
}

/** Renders docs prose, including `<fbt>` output, with inline `code` and [links](/path). */
export function renderProse(children: ReactNode): ReactNode {
  if (children == null || typeof children === "boolean") {
    return null;
  }
  if (typeof children === "string") {
    return renderInlineIfNeeded(children);
  }
  if (typeof children === "number") {
    return children;
  }
  if (Array.isArray(children)) {
    return renderProseParts(children);
  }
  if (isFbtResult(children)) {
    return renderProseParts(children.getContents());
  }
  return children;
}

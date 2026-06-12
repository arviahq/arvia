import { useEffect } from "react";

const DEFAULT_TITLE = "Arvia — Design System Compiler";

/** Sets document.title and the meta description for the current page. */
export function usePageMeta(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — Arvia` : DEFAULT_TITLE;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    }
  }, [title, description]);
}

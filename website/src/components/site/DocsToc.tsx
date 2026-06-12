import { useEffect, useState } from "react";
import { TocRail } from "../layout.arv";
import type { TocEntry } from "../docs/DocHeadingContext";
import { headingText } from "../../lib/render-prose";

export function DocsToc(props: { entries: TocEntry[] }) {
  const rail = TocRail();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const headings = props.entries
      .map((entry) => document.getElementById(entry.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (intersections) => {
        for (const entry of intersections) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            return;
          }
        }
      },
      { rootMargin: "0% 0% -75% 0%" },
    );
    for (const el of headings) observer.observe(el);
    return () => observer.disconnect();
  }, [props.entries]);

  if (props.entries.length === 0) return null;
  return (
    <nav
      className={rail.root}
      aria-label={headingText(<fbt desc="TOC aria label">{"On this page"}</fbt>)}
    >
      <p className={rail.title}>
        <fbt desc="Docs table of contents title">{"On this page"}</fbt>
      </p>
      {props.entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          data-active={entry.id === activeId || undefined}
          className={entry.level === 3 ? `${rail.link} ${rail.sub}` : rail.link}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  );
}

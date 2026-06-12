import { useEffect } from "react";
import { useLocation, useParams, Navigate } from "react-router-dom";
import { getDocs, type DocBlock } from "../docs/content";
import { getDocNav } from "../docs/nav";
import { headingId } from "../components/inline";
import { DocContent, DocsPager, DocsShell, DocsToc, type TocEntry } from "../components/ui";
import { usePageMeta } from "../page-meta";

export function DocPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const docs = getDocs();
  const doc = slug ? docs[slug] : undefined;

  usePageMeta(doc?.title, doc?.description);

  // Deep links: scroll to the heading once the page has rendered. Code blocks
  // highlight asynchronously and grow afterwards, so scroll again once layout
  // has settled.
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }
    const scroll = () => document.getElementById(location.hash.slice(1))?.scrollIntoView();
    scroll();
    const timer = setTimeout(scroll, 350);
    return () => clearTimeout(timer);
  }, [location.hash, slug]);

  if (!slug || !doc) {
    return <Navigate to="/docs/introduction" replace />;
  }

  const toc: TocEntry[] = doc.blocks
    .filter(
      (block): block is Extract<DocBlock, { type: "h2" | "h3" }> =>
        block.type === "h2" || block.type === "h3",
    )
    .map((block) => ({
      id: headingId(block.text),
      text: block.text,
      level: block.type === "h2" ? 2 : 3,
    }));

  const flat = getDocNav().flatMap((group) => group.items);
  const index = flat.findIndex((item) => item.slug === slug);
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;

  return (
    <DocsShell toc={<DocsToc entries={toc} />}>
      <DocContent title={doc.title} description={doc.description} blocks={doc.blocks} />
      <DocsPager prev={prev} next={next} />
    </DocsShell>
  );
}

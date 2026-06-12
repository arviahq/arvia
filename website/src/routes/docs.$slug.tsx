import { useEffect, useEffectEvent, type ReactNode } from "react";
import { createFileRoute, Navigate, useRouterState } from "@tanstack/react-router";
import { docBySlug, getFlatDocNav } from "../docs/registry";
import { DocHeadingProvider, useDocHeadings } from "../components/docs/DocHeadingContext";
import { DocsPager } from "../components/site/DocsPager";
import { DocsShell } from "../components/site/DocsShell";
import { DocsToc } from "../components/site/DocsToc";
import { headingText } from "../lib/render-prose";
import { usePageMeta } from "../page-meta";

export const Route = createFileRoute("/docs/$slug")({
  component: DocRoute,
});

function DocRoute() {
  const { slug } = Route.useParams();
  const entry = docBySlug[slug];
  const hash = useRouterState({ select: (state) => state.location.hash });

  usePageMeta(
    entry ? headingText(entry.meta.title) : undefined,
    entry ? headingText(entry.meta.description) : undefined,
  );

  const scrollToHash = useEffectEvent(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    document.getElementById(hash.slice(1))?.scrollIntoView();
  });

  useEffect(() => {
    scrollToHash();
    const timer = setTimeout(scrollToHash, 350);
    return () => clearTimeout(timer);
  }, [hash, slug]);

  if (!entry) {
    return <Navigate to="/docs/$slug" params={{ slug: "introduction" }} replace />;
  }

  const flat = getFlatDocNav();
  const index = flat.findIndex((item) => item.slug === slug);
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : undefined;
  const Page = entry.Page;

  return (
    <DocHeadingProvider key={slug}>
      <DocRouteBody prev={prev} next={next} Page={Page} />
    </DocHeadingProvider>
  );
}

function DocRouteBody(props: {
  prev?: { slug: string; title: ReactNode };
  next?: { slug: string; title: ReactNode };
  Page: (typeof docBySlug)[string]["Page"];
}) {
  const toc = useDocHeadings();
  const Page = props.Page;

  return (
    <DocsShell toc={<DocsToc entries={toc} />}>
      <Page />
      <DocsPager prev={props.prev} next={props.next} />
    </DocsShell>
  );
}

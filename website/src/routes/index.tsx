import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid } from "../components/site/FeatureGrid";
import { SiteHero } from "../components/site/SiteHero";
import { Playground } from "../components/Playground";
import { Heading } from "../components/heading.arv";
import { Page } from "../components/layout.arv";
import { Text } from "../components/text.arv";
import { usePageMeta } from "../page-meta";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  const page = Page();
  usePageMeta();
  return (
    <div>
      <SiteHero />
      <div className={page.root}>
        <section style={{ marginBottom: 56 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 className={Heading({ level: "h2" }).root}>
              <fbt desc="Homepage playground section heading">{"See what you ship"}</fbt>
            </h2>
            <p className={Text({ tone: "muted" }).root}>
              <fbt desc="Homepage playground section description part 1">{"Edit the"}</fbt>{" "}
              <code>.arv</code>{" "}
              <fbt desc="Homepage playground section description part 2">{"or switch to"}</fbt>{" "}
              <code>App.tsx</code>
              <fbt desc="Homepage playground section description part 3">
                {"— the preview, CSS, and TypeScript types compile live in your browser."}
              </fbt>
            </p>
          </div>
          <Playground />
        </section>
        <FeatureGrid />
      </div>
    </div>
  );
}

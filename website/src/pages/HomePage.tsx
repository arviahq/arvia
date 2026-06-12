import { FeatureGrid, Heading, Page, SiteHero, Text } from "../components/ui";
import { Playground } from "../components/Playground";
import { usePageMeta } from "../page-meta";

export function HomePage() {
  const page = Page();
  usePageMeta();
  return (
    <div>
      <SiteHero />
      <div className={page.root}>
        <section style={{ marginBottom: 56 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 className={Heading({ level: "h2" }).root}>
              <fbt desc="Homepage playground section heading">See what you ship</fbt>
            </h2>
            <p className={Text({ tone: "muted" }).root}>
              <fbt desc="Homepage playground section description part 1">Edit the</fbt>{" "}
              <code>.arv</code>{" "}
              <fbt desc="Homepage playground section description part 2">or switch to</fbt>{" "}
              <code>App.tsx</code>
              <fbt desc="Homepage playground section description part 3">
                — the preview, CSS, and TypeScript types compile live in your browser.
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

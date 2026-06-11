import { FeatureGrid, Heading, Page, SiteHero, Text } from "../components/ui";
import { Playground } from "../components/Playground";

export function HomePage() {
  const page = Page();
  return (
    <div>
      <SiteHero />
      <div className={page.root}>
        <section style={{ marginBottom: 56 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 className={Heading({ level: "h2" }).root}>See what you ship</h2>
            <p className={Text({ tone: "muted" }).root}>
              Edit the <code>.arv</code> or switch to <code>App.tsx</code> — the preview, CSS, and
              TypeScript types compile live in your browser.
            </p>
          </div>
          <Playground />
        </section>
        <FeatureGrid />
      </div>
    </div>
  );
}

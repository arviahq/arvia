import { Playground } from "../components/Playground";
import { Heading, Page, Text } from "../components/ui";
import { getThemeCss, getThemeEnv } from "../playground/theme-env";
import { getTemplateGroups } from "../playground/templates";
import { decodeShareCode } from "../playground/share";
import { usePageMeta } from "../page-meta";
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function PlaygroundPage() {
  const page = Page();
  usePageMeta("Playground");
  const location = useLocation();
  const shared = useMemo(() => decodeShareCode(location.hash), [location.hash]);
  return (
    <div className={page.root}>
      <header style={{ marginBottom: 32 }}>
        <h1 className={Heading({ level: "h1" }).root}>
          <fbt desc="Playground page title">Playground</fbt>
        </h1>
        <p className={Text({ tone: "muted", size: "lg" }).root}>
          <fbt desc="Playground page description part 1">Edit the</fbt> <code>.arv</code>{" "}
          <fbt desc="Playground page description part 2">or</fbt> <code>App.tsx</code>
          <fbt desc="Playground page description part 3">
            — the preview, CSS, and types compile live in your browser. Load any demo from the
            select.
          </fbt>
        </p>
      </header>
      <Playground
        key={shared ?? "default"}
        height={520}
        env={getThemeEnv()}
        baseCss={getThemeCss()}
        templates={getTemplateGroups()}
        initialSource={shared ?? undefined}
      />
    </div>
  );
}

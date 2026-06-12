import { useMemo } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Playground } from "../components/Playground";
import { Heading } from "../components/heading.arv";
import { Page } from "../components/layout.arv";
import { Text } from "../components/text.arv";
import { getThemeCss, getThemeEnv } from "../playground/theme-env";
import { getTemplateGroups } from "../playground/templates";
import { decodeShareCode } from "../playground/share";
import { usePageMeta } from "../page-meta";

export const Route = createFileRoute("/playground")({
  component: PlaygroundRoute,
});

function PlaygroundRoute() {
  const page = Page();
  usePageMeta("Playground");
  const hash = useRouterState({ select: (state) => state.location.hash });
  const shared = useMemo(() => decodeShareCode(hash), [hash]);

  return (
    <div className={page.root}>
      <header style={{ marginBottom: 32 }}>
        <h1 className={Heading({ level: "h1" }).root}>
          <fbt desc="Playground page title">{"Playground"}</fbt>
        </h1>
        <p className={Text({ tone: "muted", size: "lg" }).root}>
          <fbt desc="Playground page description part 1">{"Edit the"}</fbt> <code>.arv</code>{" "}
          <fbt desc="Playground page description part 2">{"or"}</fbt> <code>App.tsx</code>
          <fbt desc="Playground page description part 3">
            {
              "— the preview, CSS, and types compile live in your browser. Load any demo from the\n            select."
            }
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

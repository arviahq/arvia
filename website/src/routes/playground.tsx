import { useMemo } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { PlaygroundIDE } from "../components/PlaygroundIDE";
import { getThemeCss, getThemeEnv } from "../playground/theme-env";
import { getTemplateGroups } from "../playground/templates";
import { decodeShared } from "../playground/share";
import { usePageMeta } from "../page-meta";

export const Route = createFileRoute("/playground")({
  component: PlaygroundRoute,
});

function PlaygroundRoute() {
  usePageMeta("Playground");
  const hash = useRouterState({ select: (state) => state.location.hash });
  const shared = useMemo(() => decodeShared(hash), [hash]);

  return (
    // Edge to edge: the root layout is a 100dvh flex column on this page,
    // so the IDE fills exactly the space left below the site nav.
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <PlaygroundIDE
        key={shared ? shared.source : "default"}
        env={getThemeEnv()}
        baseCss={getThemeCss()}
        templates={getTemplateGroups()}
        initialSource={shared?.source}
        initialFramework={shared?.framework}
        initialApp={shared?.app ?? undefined}
      />
    </div>
  );
}

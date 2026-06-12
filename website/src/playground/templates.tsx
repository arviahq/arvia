import demoBadgeSource from "./components/demo-badge.arv?raw";
import demoButtonSource from "./components/demo-button.arv?raw";
import demoCardSource from "./components/demo-card.arv?raw";
import demoPulseSource from "./components/demo-pulse.arv?raw";
import demoStackSource from "./components/demo-stack.arv?raw";
import demoTextSource from "./components/demo-text.arv?raw";
import { getEditorTemplates } from "./editor/templates";
import { getRecipes } from "./recipes/index";
import type { PlaygroundTemplateGroup } from "../components/Playground";

/** Every demo on the site, loadable into the playground editor. */
export function getTemplateGroups(): PlaygroundTemplateGroup[] {
  return [
    {
      label: <fbt desc="Playground template group label">{"Starters"}</fbt>,
      items: getEditorTemplates().map((t) => ({
        id: `starter-${t.id}`,
        label: t.label,
        source: t.source,
      })),
    },
    {
      label: <fbt desc="Playground template group label">{"Demo components"}</fbt>,
      items: [
        {
          id: "demo-button",
          label: <fbt desc="Playground demo component label">{"Button"}</fbt>,
          source: demoButtonSource,
        },
        {
          id: "demo-badge",
          label: <fbt desc="Playground demo component label">{"Badge"}</fbt>,
          source: demoBadgeSource,
        },
        {
          id: "demo-card",
          label: <fbt desc="Playground demo component label">{"Card"}</fbt>,
          source: demoCardSource,
        },
        {
          id: "demo-text",
          label: <fbt desc="Playground demo component label">{"Text"}</fbt>,
          source: demoTextSource,
        },
        {
          id: "demo-stack",
          label: <fbt desc="Playground demo component label">{"Stack"}</fbt>,
          source: demoStackSource,
        },
        {
          id: "demo-pulse",
          label: <fbt desc="Playground demo component label">{"Pulse"}</fbt>,
          source: demoPulseSource,
        },
      ],
    },
    {
      label: <fbt desc="Playground template group label">{"Recipes"}</fbt>,
      items: getRecipes().map((r) => ({
        id: `recipe-${r.id}`,
        label: r.title,
        source: r.source,
      })),
    },
  ];
}

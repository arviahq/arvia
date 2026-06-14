import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";
import { BUTTON_STATES_SOURCE } from "./tutorial-snippets";

export const tutorial_statesMeta: DocPageMeta = {
  slug: "tutorial-states",
  title: <fbt desc="Docs page title — Tutorial states">{"5. States & responsive"}</fbt>,
  description: (
    <fbt desc="Docs page description — Hover, focus, breakpoints, dark mode.">
      {"Add hover and focus, then adapt across breakpoints and dark mode."}
    </fbt>
  ),
  nav: { section: "tutorial", order: 5 },
  searchText:
    "Style interaction states with & followed by a pseudo-class, nested inside base. &:hover { background: color.primaryHover; } &:focus-visible { outline: 2px solid color.text; outline-offset: 2px; } To switch styles at a breakpoint, nest a raw @media inside base: write a normal CSS condition, and a breakpoint token from the theme inlines to its value. @media (min-width: breakpoint.md) { font-size: font.lg; padding: space.4; } applies past the md breakpoint. Dark mode: declare modes: light | dark in the theme and give tokens an @dark value; moded tokens become CSS variables that flip with the OS color scheme — no JavaScript. Next: compose the card.",
};

export function TutorialStatesPage() {
  return (
    <DocArticle meta={tutorial_statesMeta}>
      <DocP>
        <fbt desc="Docs content — tut-states: intro">
          {
            "Style interaction states with `&` followed by a pseudo-class, nested right inside `base`:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`base {
  background: color.primary;

  &:hover { background: color.primaryHover; }
  &:focus-visible { outline: 2px solid color.text; outline-offset: 2px; }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: responsive">{"Respond to the viewport"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — tut-states: responsive">
          {
            "To switch styles at a breakpoint, nest a raw `@media` right inside `base`. The prelude is plain CSS — a breakpoint token from the theme inlines to its value, so `(min-width: breakpoint.md)` means “at the `md` breakpoint and up”:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`base {
  font-size: font.md;

  @media (min-width: breakpoint.md) {
    font-size: font.lg;
    padding: space.4;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — tut-states: responsive explain">
          {
            "The button uses `font.md` by default and grows to `font.lg` once the viewport passes the `md` breakpoint — plain CSS, no per-breakpoint props."
          }
        </fbt>
      </DocP>
      <DocCallout tone="tip">
        <fbt desc="Docs note — tut-states: dark">
          {
            "Dark mode is free: declare `modes: light | dark` in the theme and give a token an `@dark` value. Moded tokens compile to CSS variables that flip with the OS color scheme — no JavaScript."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: try it">{"Try it"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — tut-states: playground lead">
          {
            "This button has hover, focus, a responsive size, and a dark-mode token. Hover it in the preview:"
          }
        </fbt>
      </DocP>
      <DocPlayground source={BUTTON_STATES_SOURCE} />
      <DocP>
        <fbt desc="Docs content — tut-states: next">
          {"Last step: [compose the card](/docs/tutorial-compose)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}

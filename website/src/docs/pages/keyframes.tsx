import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const keyframesMeta: DocPageMeta = {
  slug: "keyframes",
  title: <fbt desc="Docs page title — Keyframes">{"Keyframes"}</fbt>,
  description: (
    <fbt desc="Docs page description — Animations.">
      {"Write @keyframes anywhere — they pass straight through to CSS."}
    </fbt>
  ),
  nav: { section: "language", order: 13 },
  searchText:
    "Arvia does not have a keyframes construct — write a raw CSS @keyframes at-rule anywhere (top level, inside a component, or in global) and it is emitted verbatim. @keyframes pulse { from { opacity: 1; } to { opacity: 0.45; } } Reference it by its literal name in an animation declaration: component Badge { base { animation: pulse duration.fast; } } Names are NOT hashed and tokens inside a @keyframes body are not rewritten — the block passes through untouched. Related: At-rules, Theme, Components.",
};

export function KeyframesPage() {
  return (
    <DocArticle meta={keyframesMeta}>
      <DocP>
        <fbt desc="Docs content — keyframes: what">
          {
            "Arvia has no `keyframes` construct. Write a raw CSS `@keyframes` at-rule anywhere — at the top level, inside a component, or in `global` — and it passes straight through to the output:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`@keyframes pulse {
  from { opacity: 1; }
  to { opacity: 0.45; }
}`}
      />
      <DocP>
        <fbt desc="Docs content — keyframes: reference">
          {"Reference it by its literal name in an `animation` declaration:"}
        </fbt>
      </DocP>
      <DocCode
        label={"badge.arv"}
        code={`component Badge {
  base {
    animation: pulse duration.fast;
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — keyframes: passthrough">
          {
            "`@keyframes` is pure pass-through: names are emitted verbatim (not hashed) and the body is copied as-is, so token-shaped text inside a step is left untouched. You own naming and collision avoidance, exactly like hand-written CSS."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — keyframes: related">
          {
            "[CSS & at-rules](/docs/css) · [Responsive](/docs/responsive) · [Container queries](/docs/container-queries)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}

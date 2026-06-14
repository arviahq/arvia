import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const container_queriesMeta: DocPageMeta = {
  slug: "container-queries",
  title: <fbt desc="Docs page title — Container queries">{"Container queries"}</fbt>,
  description: (
    <fbt desc="Docs page description — Adapt to container width.">
      {"Nest raw @container; container-size tokens inline to their value."}
    </fbt>
  ),
  nav: { section: "language", order: 12 },
  searchText:
    "Container queries adapt a component to its own width, not the viewport's. Write a raw @container at-rule nested in base — set container-type: inline-size on the element yourself first. Define container tokens in the theme: container-size { wide = 480px; }. component Card { base { container-type: inline-size; flex-direction: column; @container (min-width: container-size.wide) { flex-direction: row; } } } The @container prelude is plain CSS, just like @media; the only thing inlined is container-size.X references, measured in inline-size: (min-width: container-size.wide) becomes @container (min-width: 480px), (inline-size < container-size.wide) becomes (inline-size < 480px), and (container-size.narrow <= inline-size < container-size.wide) is a half-open band. A prelude with no token refs passes through verbatim. An unknown container-size ref surfaces as ARV101. Related: Responsive, At-rules.",
};

export function ContainerQueriesPage() {
  return (
    <DocArticle meta={container_queriesMeta}>
      <DocP>
        <fbt desc="Docs content — container: what">
          {
            "Container queries adapt a component to its own width, not the viewport's. Set `container-type` on the element, then nest a raw `@container` at-rule — write a plain CSS condition, and any `container-size.X` reference inlines to its value (measured in `inline-size`):"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  container-size { wide = 480px; }
}`}
      />
      <DocCode
        label={"card.arv"}
        code={`component Card {
  base {
    container-type: inline-size;
    flex-direction: column;

    @container (min-width: container-size.wide) {
      flex-direction: row;
    }
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — container: same component">
          {
            "The card stacks by default and becomes a row once its own width reaches the `wide` token — so the same card adapts in a narrow sidebar and a full-width region. Set `container-type` yourself; Arvia no longer injects it."
          }
        </fbt>
      </DocCallout>
      <DocP>
        <fbt desc="Docs content — container: ranges">
          {
            "Condition forms match [responsive](/docs/responsive): `(min-width: container-size.wide)` becomes `@container (min-width: 480px)`, `(inline-size < container-size.wide)` caps below a size, and `(container-size.narrow <= inline-size < container-size.wide)` is a half-open band. A prelude with no token refs like `@container (min-width: 30rem)` is emitted verbatim."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — container: related">
          {
            "[CSS & at-rules](/docs/css) · [Responsive](/docs/responsive) for viewport breakpoints · [Keyframes](/docs/keyframes)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}

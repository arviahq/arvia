import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const responsiveMeta: DocPageMeta = {
  slug: "responsive",
  title: <fbt desc="Docs page title — Responsive">{"Responsive"}</fbt>,
  description: (
    <fbt desc="Docs page description — Media queries with breakpoint tokens.">
      {"Nest raw @media anywhere; breakpoint tokens inline to their value."}
    </fbt>
  ),
  nav: { section: "language", order: 11 },
  searchText:
    "Write a raw CSS @media at-rule anywhere a declaration can go — inside base, a slot, or a variant value. The prelude is plain CSS and passes straight through; the only thing Arvia touches is breakpoint-token references, which inline to their literal value at compile time. First define breakpoint tokens in the theme: breakpoint { md = 768px; }. component Button { base { padding: 4px; @media (min-width: breakpoint.md) { padding: 16px; } } } compiles (min-width: breakpoint.md) to @media (min-width: 768px). Write any condition you like: (width < breakpoint.lg) becomes (width < 1024px), and (breakpoint.md <= width < breakpoint.xl) becomes (768px <= width < 1280px). A prelude with no token refs like (min-width: 900px) is emitted verbatim. An unknown breakpoint ref surfaces as ARV101. Related: At-rules, Container queries.",
};

export function ResponsivePage() {
  return (
    <DocArticle meta={responsiveMeta}>
      <DocP>
        <fbt desc="Docs content — responsive: what">
          {
            "Responsive styling is just CSS `@media`. Nest an `@media` at-rule anywhere a declaration can go — inside `base`, a slot, or a variant value — and it passes straight through:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"button.arv"}
        code={`component Button {
  base {
    padding: 4px;

    @media (min-width: 768px) {
      padding: 16px;
    }
  }
}`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: tokens">{"Breakpoint token references"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — responsive: tokens">
          {
            "Define breakpoint tokens in the theme, then reference them by name inside any `@media` condition. Each `breakpoint.X` inlines to its literal value at compile time; the rest of the prelude is untouched CSS:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  breakpoint { md = 768px; lg = 1024px; xl = 1280px; }
}`}
      />
      <DocCode
        label={"button.arv"}
        code={`base {
  @media (min-width: breakpoint.md)                  { /* … */ }   // @media (min-width: 768px)
  @media (width < breakpoint.lg)                     { /* … */ }   // @media (width < 1024px)
  @media (breakpoint.md <= width < breakpoint.xl)    { /* … */ }   // @media (768px <= width < 1280px)
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — responsive: passthrough">
          {
            "Only `breakpoint.X` references are inlined; everything else in the prelude is plain CSS. A condition with no token refs like `@media (min-width: 900px)` or `@media screen and (...)` is emitted verbatim. An unknown breakpoint name surfaces as ARV101 (unknown token reference) with a did-you-mean fix."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — responsive: related">
          {
            "[CSS & at-rules](/docs/css) · [Variants & defaults](/docs/variants) · [Container queries](/docs/container-queries)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}

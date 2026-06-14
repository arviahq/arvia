import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocH3 } from "../../components/docs/DocH3";
import { DocP } from "../../components/docs/DocP";
import { DocUl } from "../../components/docs/DocUl";
import { DocLi } from "../../components/docs/DocLi";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import { DocPlayground } from "../../components/docs/DocPlayground";
import type { DocPageMeta } from "../registry";

export const cssMeta: DocPageMeta = {
  slug: "css",
  title: <fbt desc="Docs page title — CSS">{"CSS & at-rules"}</fbt>,
  description: (
    <fbt desc="Docs page description — CSS support.">
      {"Raw CSS at-rules pass straight through; token refs in conditions inline to their value."}
    </fbt>
  ),
  nav: { section: "language", order: 10.5 },
  searchText:
    "Arvia is CSS-first. A declaration value is raw CSS — token refs like color.primary are substituted, everything else passes through. Any at-rule (@keyframes, @media, @container, @supports, @layer, @font-face) can be nested anywhere a declaration goes: base, a slot, a variant value, a recipe, a style, global, or the top level. Inside a component the at-rule's bare declarations are scoped to the owning slot class; in global and at the top level it is emitted as authored. @keyframes is pure pass-through with literal (un-hashed) names. There is no range sugar — write full CSS conditions. Token refs inside a @media/@container prelude inline to their literal value, so breakpoints stay centralized: @media (min-width: breakpoint.md) compiles to @media (min-width: 768px); @container (inline-size < container-size.wide) → (inline-size < 480px). Any other media/container feature works too — max-height, orientation, aspect-ratio. Example: base { padding: 4px; @media (min-width: breakpoint.md) { padding: 16px; } }.",
};

const MEDIA_CARD_SOURCE = `theme {
  space { 3 = 12px; 4 = 16px; 5 = 24px; }
  radius { lg = 14px; }
  color { surface = #ffffff; border = #e4e4e7; text = #18181b; }
  breakpoint { lg = 1024px; }
  container-size { wide = 480px; }
  duration { normal = 200ms; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

component MediaCard {
  base {
    container-type: inline-size;
    display: flex;
    flex-direction: column;
    gap: space.3;
    padding: space.4;
    border-radius: radius.lg;
    border: 1px solid color.border;
    background: color.surface;
    color: color.text;
    animation: fadeIn duration.normal ease;

    @media (min-width: breakpoint.lg) {   // breakpoint.lg → 1024px
      padding: space.5;
    }
    @container (min-width: container-size.wide) {  // the card's own width
      flex-direction: row;
      align-items: center;
    }
    @supports (-webkit-line-clamp: 2) {   // any at-rule, verbatim
      overflow: hidden;
    }
  }
}`;

export function CssPage() {
  return (
    <DocArticle meta={cssMeta}>
      <DocP>
        <fbt desc="Docs content — css: intro">
          {
            "Arvia is CSS-first. A declaration's value is raw CSS — a `color.primary` ref is substituted, everything else passes through untouched. The same is true of at-rules: write `@media`, `@keyframes`, `@supports` — any of them — and Arvia emits them as-is. The only convenience: token refs inside a `@media`/`@container` condition inline to their value, so breakpoints stay centralized."
          }
        </fbt>
      </DocP>
      <DocP>
        <fbt desc="Docs content — css: example intro">
          {
            "Here is everything at once — an entrance animation, a viewport breakpoint, a container query, and a feature query, all in one `base` block. Edit it and watch the compiled CSS on the right:"
          }
        </fbt>
      </DocP>
      <DocPlayground source={MEDIA_CARD_SOURCE} height={320} />

      <DocH2>
        <fbt desc="Docs content — css: heading at-rules">{"Raw at-rules"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css: at-rules">
          {
            "Every at-rule is pass-through. Nest one wherever a declaration can go — feature queries are a common case, falling back gracefully when a property isn't supported:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"toolbar.arv"}
        code={`component Toolbar {
  base {
    display: flex;
    gap: 8px;

    @supports (gap: 1px) {
      gap: space.3;
    }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — css: keyframes">
          {
            "`@keyframes` is the same — write it at the top level (or in a slot, or `global`) and reference it by its literal name. Names are emitted verbatim, never hashed, and the body is copied as-is:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"spinner.arv"}
        code={`@keyframes spin {
  to { transform: rotate(360deg); }
}

component Spinner {
  base {
    animation: spin 1s linear infinite;
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — css: scoping">
          {
            "Inside a component, an at-rule's bare declarations are scoped to the owning slot's class — `@media (min-width: 768px) { padding: 16px }` in `base` compiles to `@media (min-width: 768px) { .Card_root_x { padding: 16px } }`. At the top level and inside `global`, the at-rule is emitted exactly as you wrote it."
          }
        </fbt>
      </DocCallout>

      <DocH2>
        <fbt desc="Docs content — css: heading tokens">{"Token refs in conditions"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — css: tokens what">
          {
            "Hardcoding pixel breakpoints scatters magic numbers. Instead, keep them in an ordinary token group and reference them in the condition — the ref inlines to its literal value (never a `var()`, which CSS conditions can't use):"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  breakpoint { md = 768px; lg = 1024px; }
  container-size { wide = 480px; }
}`}
      />
      <DocCode
        label={"button.arv"}
        code={`base {
  font-size: font.sm;

  @media (min-width: breakpoint.md) {                 // → (min-width: 768px)
    font-size: font.md;
  }
  @media (breakpoint.md <= width < breakpoint.lg) {   // full range syntax, your call
    letter-spacing: 0;
  }
  @container (min-width: container-size.wide) {        // → (min-width: 480px)
    flex-direction: row;
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — css: tokens groups">
          {
            "`breakpoint` and `container-size` are just ordinary token groups here — there are no reserved names, and you choose whatever group names you like. Because you write the full condition, every media/container feature is available: `max-height`, `orientation`, `aspect-ratio`, `prefers-reduced-motion`, and so on."
          }
        </fbt>
      </DocP>
      <DocCallout tone="info">
        <fbt desc="Docs note — css: passthrough">
          {
            "Only `group.name` refs are substituted; the rest of the condition is emitted byte-for-byte. A condition with no refs — `@media (min-width: 900px)`, `@media print` — passes through unchanged."
          }
        </fbt>
      </DocCallout>

      <DocH2>
        <fbt desc="Docs content — css: heading where">{"Where you can write CSS"}</fbt>
      </DocH2>
      <DocUl>
        <DocLi>
          <fbt desc="Docs list — declarations">
            {
              "Declarations and custom properties — in `base`, slots, variant values, [recipes](/docs/recipes), [styles](/docs/styles), `global` rules, and inside any at-rule."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — states">
            {
              "States & nested selectors (`&:hover`, `& .child`) — in `base`, variant values, recipes, styles and slots. See [States](/docs/states)."
            }
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — raw selectors">
            {"Raw selector rules (`html, body { … }`) — in [`global`](/docs/global) blocks."}
          </fbt>
        </DocLi>
        <DocLi>
          <fbt desc="Docs list — at-rules">
            {
              "At-rules (`@media`, `@keyframes`, `@supports`, …) — at the top level, in `global`, `base`, slots, variant values, recipes, styles, and nested in other at-rules."
            }
          </fbt>
        </DocLi>
      </DocUl>

      <DocH3>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH3>
      <DocP>
        <fbt desc="Docs content — css: related">
          {
            "[Responsive](/docs/responsive) · [Container queries](/docs/container-queries) · [Keyframes](/docs/keyframes) · [Global styles](/docs/global) · [States](/docs/states)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}

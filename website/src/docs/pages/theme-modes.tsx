import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const theme_modesMeta: DocPageMeta = {
  slug: "theme-modes",
  title: <fbt desc="Docs page title — Theme modes">{"Theme modes"}</fbt>,
  description: (
    <fbt desc="Docs page description — Light and dark with zero JavaScript.">
      {"Light and dark tokens that flip with no runtime."}
    </fbt>
  ),
  nav: { section: "language", order: 1 },
  searchText:
    "Declare modes at the top of the theme, then give any token a per-mode value with @mode. theme { modes: light | dark; color { text = #18181b; surface = #ffffff; @dark { text = #f4f4f5; surface = #18181b; } } } Color tokens that change between modes compile to a single light-dark() value on :root, driven by the color-scheme property — so the page follows the OS color scheme by default and native form controls and scrollbars follow the mode too. Setting data-arvia-theme on <html> flips color-scheme, which flips every light-dark() color. Tokens without a @mode override stay inlined; mode-varying values that are not colors (like box-shadow) keep per-mode [data-arvia-theme] override blocks. No JavaScript runs to restyle — it is plain CSS variables. Requires a Baseline 2024 browser (Chrome 123+, Safari 17.5+, Firefox 120+) for light-dark(). Related: Theme, Token docs.",
};

export function ThemeModesPage() {
  return (
    <DocArticle meta={theme_modesMeta}>
      <DocP>
        <fbt desc="Docs content — modes: what">
          {
            "Declare `modes` at the top of the theme, then give any token a per-mode value with `@mode`:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/theme.arv"}
        code={`theme {
  modes: light | dark;

  color {
    text = #18181b;
    surface = #ffffff;

    @dark {
      text = #f4f4f5;
      surface = #18181b;
    }
  }
}`}
      />
      <DocP>
        <fbt desc="Docs content — modes: generates">
          {
            "Color tokens that change between modes compile to a single `light-dark()` value on `:root`, driven by the `color-scheme` property. Tokens without a `@mode` override stay inlined; mode-varying values that aren't colors (like `box-shadow`) keep per-mode `[data-arvia-theme]` blocks."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"generated CSS"}
        lang={"css"}
        code={`:root {
  color-scheme: light dark;
  --arvia-color-text: light-dark(#18181b, #f4f4f5);
  --arvia-color-surface: light-dark(#ffffff, #18181b);
}
[data-arvia-theme="light"] { color-scheme: light; }
[data-arvia-theme="dark"] { color-scheme: dark; }`}
      />
      <DocCallout tone="tip">
        <fbt desc="Docs note — modes: switching">
          {
            "By default the page follows the OS color scheme via `color-scheme: light dark`. To switch manually, set `data-arvia-theme` on `<html>` — it flips `color-scheme`, which flips every `light-dark()` color (and themes native form controls and scrollbars too). No JavaScript runs to restyle."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — modes: related">
          {"[Theme & tokens](/docs/theme) · [Token docs](/docs/token-docs)."}
        </fbt>
      </DocP>
    </DocArticle>
  );
}

import { fbt } from "fbtee";
import { cli } from "./pages/cli";
import { compilation } from "./pages/compilation";
import { components } from "./pages/components";
import { compound } from "./pages/compound";
import { containerQueries } from "./pages/container-queries";
import { global } from "./pages/global";
import { installation } from "./pages/installation";
import { introduction } from "./pages/introduction";
import { keyframes } from "./pages/keyframes";
import { languageServer } from "./pages/language-server";
import { localTokens } from "./pages/local-tokens";
import { packages } from "./pages/packages";
import { patterns } from "./pages/patterns";
import { quickStart } from "./pages/quick-start";
import { recipes } from "./pages/recipes";
import { responsive } from "./pages/responsive";
import { slots } from "./pages/slots";
import { states } from "./pages/states";
import { storybook } from "./pages/storybook";
import { styles } from "./pages/styles";
import { theme } from "./pages/theme";
import { themeModes } from "./pages/theme-modes";
import { thinkingInArvia } from "./pages/thinking-in-arvia";
import { tokenDocs } from "./pages/token-docs";
import { variants } from "./pages/variants";
import { vitePlugin } from "./pages/vite-plugin";

export type DocSection = {
  title: string;
  slug: string;
  description: string;
  blocks: DocBlock[];
};

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; label?: string; code: string; lang?: string }
  | { type: "note"; tone: "info" | "warning" | "tip"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

/** One entry per docs page, keyed by slug. Content lives in ./pages/. */
export function getDocs(): Record<string, DocSection> {
  return {
    introduction: introduction(),
    installation: installation(),
    "quick-start": quickStart(),
    "thinking-in-arvia": thinkingInArvia(),

    theme: theme(),
    "theme-modes": themeModes(),
    global: global(),
    recipes: recipes(),
    styles: styles(),
    components: components(),
    slots: slots(),
    "local-tokens": localTokens(),
    variants: variants(),
    compound: compound(),
    states: states(),
    responsive: responsive(),
    "container-queries": containerQueries(),
    keyframes: keyframes(),
    "token-docs": tokenDocs(),

    compilation: compilation(),
    patterns: patterns(),

    packages: packages(),
    "vite-plugin": vitePlugin(),
    cli: cli(),
    "language-server": languageServer(),
    storybook: storybook(),
  };
}

export type Example = {
  id: string;
  title: string;
  description: string;
  arv: string;
  usage?: string;
};

export function getExamples(): Example[] {
  return [
    {
      id: "tokens",
      title: fbt("Theme tokens", "Docs page title — Theme tokens"),
      description: fbt(
        "Named design tokens in groups.",
        "Docs page description — Named design tokens in groups.",
      ),
      arv: `theme {
  color { primary = #635bff; }
  space { 2 = 8px; 4 = 16px; }
}`,
    },
    {
      id: "modes",
      title: fbt("Theme modes", "Docs page title — Theme modes"),
      description: fbt(
        "Light and dark with @dark overrides.",
        "Docs page description — Light and dark with @dark overrides.",
      ),
      arv: `theme {
  modes: light | dark;
  color {
    text = #111;
    @dark { text = #eee; }
  }
}`,
    },
    {
      id: "doc-strings",
      title: fbt("Token docs", "Docs page title — Token docs"),
      description: fbt(
        "doc metadata on tokens.",
        "Docs page description — doc metadata on tokens.",
      ),
      arv: `color {
  primary = #635bff doc "Brand primary";
}`,
    },
    {
      id: "global",
      title: fbt("Global styles", "Docs page title — Global styles"),
      description: fbt("Document-level rules.", "Docs page description — Document-level rules."),
      arv: `global {
  body { margin: 0; color: color.text; }
}`,
    },
    {
      id: "recipe",
      title: fbt("Recipes", "Docs page title — Recipes"),
      description: fbt(
        "Composable style fragments.",
        "Docs page description — Composable style fragments.",
      ),
      arv: `recipe Surface {
  border: 1px solid #e5e5e5;
  background: white;
}`,
    },
    {
      id: "implicit-root",
      title: fbt("Implicit root", "Docs page title — Implicit root"),
      description: fbt(
        "Top-level declarations become root styles.",
        "Docs page description — Top-level declarations become root styles.",
      ),
      arv: `component Badge {
  padding: 2px 8px;
  border-radius: 999px;
}`,
    },
    {
      id: "slots",
      title: fbt("Slots", "Docs page title — Slots"),
      description: fbt(
        "Named parts of a component.",
        "Docs page description — Named parts of a component.",
      ),
      arv: `component Button {
  slots {
    root {}
    icon { flex-shrink: 0; }
  }
}`,
    },
    {
      id: "variants",
      title: fbt("Variants", "Docs page title — Variants"),
      description: fbt(
        "Prop-driven style branches.",
        "Docs page description — Prop-driven style branches.",
      ),
      arv: `variants {
  tone {
    primary { background: color.primary; }
    danger { background: color.danger; }
  }
}`,
    },
    {
      id: "compound",
      title: fbt("Compound variants", "Docs page title — Compound variants"),
      description: fbt("Multi-variant rules.", "Docs page description — Multi-variant rules."),
      arv: `compound {
  size: sm;
  tone: danger;
  root { font-weight: 700; }
}`,
    },
    {
      id: "states",
      title: fbt("States", "Docs page title — States"),
      description: fbt("Pseudo-class styles.", "Docs page description — Pseudo-class styles."),
      arv: `&:hover { filter: brightness(1.05); }
&:focus-visible { outline: 2px solid color.primary; }`,
    },
    {
      id: "responsive",
      title: fbt("Responsive", "Docs page title — Responsive"),
      description: fbt("Breakpoint overrides.", "Docs page description — Breakpoint overrides."),
      arv: `responsive {
  md { size: lg; }
}`,
      usage: `Button({ size: { initial: "sm", md: "lg" } });`,
    },
    {
      id: "container",
      title: fbt("Container queries", "Docs page title — Container queries"),
      description: fbt(
        "Container-width layout.",
        "Docs page description — Container-width layout.",
      ),
      arv: `container {
  wide { layout: row; }
}`,
      usage: `Card({ layout: { initial: "stacked", $wide: "row" } });`,
    },
    {
      id: "keyframes",
      title: fbt("Keyframes", "Docs page title — Keyframes"),
      description: fbt("Named animations.", "Docs page description — Named animations."),
      arv: `keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
    },
    {
      id: "styles",
      title: fbt("Styles", "Docs page title — Styles"),
      description: fbt(
        "Exported one-class utilities.",
        "Docs page description — Exported one-class utilities.",
      ),
      arv: `style truncate {
  overflow: hidden;
  text-overflow: ellipsis;
}`,
      usage: `import { truncate } from "./utils.arv";

<p className={truncate}>Long text…</p>;`,
    },
    {
      id: "local-tokens",
      title: fbt("Local tokens", "Docs page title — Local tokens"),
      description: fbt(
        "Component-scoped values.",
        "Docs page description — Component-scoped values.",
      ),
      arv: `component Chip {
  tokens { space { pad = 6px; } }
  base { padding: space.pad; }
}`,
    },
  ];
}

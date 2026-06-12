import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function theme(): DocSection {
  return {
    title: fbt("Theme & tokens", "Docs page title — Theme & tokens"),
    slug: "theme",
    description: fbt(
      "Design tokens: groups, references, aliases, and how they reach every file.",
      "Docs page description — Design tokens in depth.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "A `theme` block declares design tokens: named values organized into groups. Tokens are the vocabulary the rest of your styles are written in — every other construct references them with dot notation.",
          "Docs content — theme: opening",
        ),
      },
      {
        type: "code",
        label: "src/theme.arv",
        code: `theme {
  color {
    primary = #635bff;
    danger = #e5484d;
  }
  space {
    1 = 4px;
    2 = 8px;
    4 = 16px;
  }
  radius { md = 8px; full = 999px; }
  font { sm = 13px; md = 15px; }
  duration { fast = 120ms; }
  easing { out = cubic-bezier(0.16, 1, 0.3, 1); }
  breakpoint { md = 768px; }
  container { wide = 480px; }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Group names are yours to invent — color, space, and radius are conventions, not keywords. A token value is any CSS value text: lengths, colors, font stacks, cubic-bezier() curves, shadows. Token names may start with digits, which makes numeric scales like `space.1`, `space.2` natural to write.",
          "Docs content — theme: groups are free-form",
        ),
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "Two group names are special: breakpoint feeds `responsive` blocks and container feeds `container` blocks. They configure queries — they cannot be referenced as values and are not part of the tokens export.",
          "Docs note — theme: special groups",
        ),
      },
      { type: "h2", text: fbt("Referencing tokens", "Docs content — heading: referencing tokens") },
      {
        type: "p",
        text: fbt(
          "Anywhere a CSS value appears — components, recipes, styles, global rules, keyframes — write group.name and the compiler substitutes the value. References work inside functions and shorthand values too:",
          "Docs content — theme: referencing lead-in",
        ),
      },
      {
        type: "code",
        code: `component Card {
  base {
    padding: space.2 space.4;
    width: calc(space.4 * 10);
    background: linear-gradient(color.primary, color.danger);
    transition: opacity duration.fast easing.out;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          'References are checked. A typo like color.primry is a compile error (ARV101) with a did-you-mean suggestion and an automatic fix in the editor. Dots that do not start with a known group name — grid-area: main.start, url("a.b/img.png") — pass through untouched, so ordinary CSS never fights the checker.',
          "Docs content — theme: checked references",
        ),
      },
      { type: "h2", text: fbt("Token aliases", "Docs content — heading: token aliases") },
      {
        type: "p",
        text: fbt(
          "A token value can reference earlier tokens, including from other groups. Use aliases to give semantic names to raw values, or to build composite tokens:",
          "Docs content — theme: aliases lead-in",
        ),
      },
      {
        type: "code",
        code: `theme {
  color {
    base = #111111;
    text = color.base;
  }
  border {
    thin = 1px solid color.base;
  }
}`,
      },
      {
        type: "p",
        text: fbt(
          "Aliases resolve at compile time — border.thin becomes 1px solid #111111 in the output. Chains are followed (a = b, b = c works), and aliases respect theme `modes:` an alias of a moded token carries both mode values. One rule: tokens must be defined before they are referenced; forward references are an error.",
          "Docs content — theme: alias semantics",
        ),
      },
      {
        type: "h2",
        text: fbt("How tokens reach every file", "Docs content — heading: global env"),
      },
      {
        type: "p",
        text: fbt(
          "The theme file configured in the Vite plugin (`src/theme.arv` by convention) is compiled first, and its tokens, recipes, and keyframes become the shared environment every other `.arv` file is checked against. That is why component files reference `color.primary` with no import — the theme is ambient, like a standard library.",
          "Docs content — theme: shared env",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Other files can declare their own `theme` blocks too. File-level tokens extend the shared environment for that file only — useful for page-specific values — and a component's `tokens` block scopes values to a single component (see [Local tokens](/docs/local-tokens)). Within one file, declaring the same group twice or the same token twice is an error (ARV112), so there is always exactly one place a value lives.",
          "Docs content — theme: extension and duplicates",
        ),
      },
      {
        type: "h2",
        text: fbt("What tokens compile to", "Docs content — heading: what tokens compile to"),
      },
      {
        type: "p",
        text: fbt(
          "In a single-mode theme (no `modes` declaration), every reference is inlined to its literal value — the CSS contains 8px, not a variable. Declare modes and the moded tokens become CSS custom properties named --arvia-<group>-<name>, switched by mode (see [Theme modes](/docs/theme-modes)):",
          "Docs content — theme: compile single vs moded",
        ),
      },
      {
        type: "code",
        label: "generated CSS (moded theme)",
        lang: "css",
        code: `:root {
  --arvia-color-primary: #635bff;
}

.Button_root_0p4oom {
  background: var(--arvia-color-primary);
}`,
      },
      {
        type: "h2",
        text: fbt("Using tokens from TypeScript", "Docs content — heading: tokens from ts"),
      },
      {
        type: "p",
        text: fbt(
          "The theme file also exports its tokens as a typed object, for the occasional inline style, canvas drawing, or charting library. Values are literals in single-mode themes and `var()` references in moded themes — so they stay correct when the mode flips:",
          "Docs content — theme: tokens export lead-in",
        ),
      },
      {
        type: "code",
        label: "App.tsx",
        code: `import { tokens } from "./theme.arv";

tokens.color.primary;  // "#635bff" — or "var(--arvia-color-primary)" with modes
tokens.space["2"];     // "8px"

// Generated alongside: per-group key unions
import type { ColorToken } from "./theme.arv"; // "primary" | "danger" | …`,
      },
      {
        type: "note",
        tone: "warning",
        text: fbt(
          "Only files that declare theme tokens export a tokens object — import it from your theme file, not from component files. A component or style named 'tokens' in a theme file collides with the export and is rejected (ARV125).",
          "Docs note — theme: tokens export location",
        ),
      },
      {
        type: "h2",
        text: fbt("Designing a token scale", "Docs content — heading: designing scales"),
      },
      {
        type: "ul",
        items: [
          fbt(
            "Name by role where it pays off: `color.text` and `color.surface` survive a rebrand; `color.gray100` does not.",
            "Docs list item — theme: name by role",
          ),
          fbt(
            "Use digit-led names for ordered scales (`space.1` … `space.9`, `font.sm` … `font.3xl`) — they sort naturally and read like math.",
            "Docs list item — theme: digit scales",
          ),
          fbt(
            'Document intent with doc strings — primary = #635bff doc "CTAs and links" — and the meaning shows up on hover in your editor (see [Token docs](/docs/token-docs)).',
            "Docs list item — theme: doc strings",
          ),
        ],
      },
    ],
  };
}

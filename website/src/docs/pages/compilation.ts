import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function compilation(): DocSection {
  return {
    title: fbt("How compilation works", "Docs page title — How compilation works"),
    slug: "compilation",
    description: fbt(
      "The pipeline from .arv source to CSS, JS, and types — and why HMR is instant.",
      "Docs page description — The compilation pipeline in depth.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Nothing in Arvia is magic, and this page proves it: we follow one file through the compiler and read what comes out. Understanding the output makes debugging trivial — DevTools shows you class names you can decode at a glance.",
          "Docs content — compilation: opening",
        ),
      },
      { type: "h2", text: fbt("The pipeline", "Docs content — heading: pipeline") },
      {
        type: "table",
        headers: [
          fbt("Stage", "Docs table header — stage"),
          fbt("What it does", "Docs table header — stage what"),
        ],
        rows: [
          [
            fbt("Lexer", "Docs table cell — lexer"),
            fbt(
              "Tokenizes the source. CSS values and selectors are captured as raw text, so any value the browser accepts passes through.",
              "Docs table cell — lexer what",
            ),
          ],
          [
            fbt("Parser", "Docs table cell — parser"),
            fbt(
              "Builds the syntax tree, with error recovery — one mistake produces one diagnostic, not a cascade.",
              "Docs table cell — parser what",
            ),
          ],
          [
            fbt("Checker", "Docs table cell — checker"),
            fbt(
              "Validates everything nameable: token refs, recipe refs and cycles, slots, variants, defaults, compound matchers, CSS property names and value syntax. Produces did-you-mean fixes.",
              "Docs table cell — checker what",
            ),
          ],
          [
            fbt("IR builder", "Docs table cell — ir"),
            fbt(
              "Flattens the tree: recipes are inlined, token references resolved, slots materialized, class names assigned.",
              "Docs table cell — ir what",
            ),
          ],
          [
            fbt("Emitters", "Docs table cell — emitters"),
            fbt(
              "Three independent generators write the CSS, the JS module, and the `.d.ts` declarations from the same IR.",
              "Docs table cell — emitters what",
            ),
          ],
        ],
      },
      {
        type: "p",
        text: fbt(
          "Errors stop emission — a file with an error produces diagnostics and no artifacts, so a broken component can never ship half-styled. Warnings (unknown CSS property ARV180, suspicious value syntax ARV181, unused recipe ARV172…) emit normally.",
          "Docs content — compilation: errors stop emission",
        ),
      },
      { type: "h2", text: fbt("Class names and the hash", "Docs content — heading: hash") },
      {
        type: "p",
        text: fbt(
          "Every class follows `Component_variant_value_slot_hash`. The 6-character hash is FNV-1a over the file's project-relative path plus the component name — crucially, not over the styles:",
          "Docs content — compilation: hash lead-in",
        ),
      },
      {
        type: "code",
        label: "the scheme",
        lang: "css",
        code: `.Button_root_0p4oom { }                       /* base, root slot */
.Button_icon_0p4oom { }                       /* base, icon slot */
.Button_size_lg_root_0p4oom { }               /* variant value */
.Button_size_sm_tone_danger_root_0p4oom { }   /* compound */
.Button_size_lg_bp_md_root_0p4oom { }         /* responsive (breakpoint md) */
.Button_layout_row_cq_wide_root_0p4oom { }    /* container (size wide) */`,
      },
      {
        type: "p",
        text: fbt(
          "Path-based hashing has two consequences. Components with the same name in different files never collide. And editing styles never changes a class name — which is the foundation of the HMR story below. The trade-off: moving or renaming a file changes its hashes, which only matters if you cache generated CSS across deploys keyed by class name.",
          "Docs content — compilation: hash consequences",
        ),
      },
      { type: "h2", text: fbt("The generated JavaScript", "Docs content — heading: generated js") },
      {
        type: "p",
        text: fbt(
          "The JS module is data plus one small helper. Per component: a base class map, a variants table, `compound` entries, defaults, and responsive/container tables. The exported function delegates to a shared helper that walks them:",
          "Docs content — compilation: js lead-in",
        ),
      },
      {
        type: "code",
        label: "generated JS (abridged)",
        lang: "js",
        code: `const Button_base = { root: "Button_root_0p4oom", icon: "Button_icon_0p4oom" };

const Button_variants = {
  size: {
    sm: { root: "Button_size_sm_root_0p4oom" },
    lg: { root: "Button_size_lg_root_0p4oom", icon: "Button_size_lg_icon_0p4oom" },
  },
  tone: { /* … */ },
};

const Button_compounds = [
  [{ size: "sm", tone: "danger" }, { root: "Button_size_sm_tone_danger_root_0p4oom" }],
];

const Button_defaults = { size: "md", tone: "primary" };

export function Button(props) {
  return _h(Button_base, Button_variants, Button_compounds, Button_defaults,
            /* responsive/container tables */ …, ["root", "icon"], props);
}`,
      },
      {
        type: "p",
        text: fbt(
          "The helper, per slot: start from the base class; add the class for each variant's effective value (prop or default, with object props contributing their initial plus per-breakpoint classes); add author-time responsive and container overrides for variants the caller did not pin; then add every compound whose matchers all equal the effective values. String concatenation throughout — measure it and you will find it indistinguishable from a hardcoded className.",
          "Docs content — compilation: helper algorithm",
        ),
      },
      {
        type: "h2",
        text: fbt("The generated declarations", "Docs content — heading: generated dts"),
      },
      {
        type: "code",
        label: "generated .d.ts",
        code: `export type ButtonProps = {
  size?: "sm" | "md" | "lg" | { initial?: "sm" | "md" | "lg"; md?: "sm" | "md" | "lg"; };
  tone: "primary" | "danger";    // no default → required
};

export type ButtonSlots = { root: string; icon: string; };

export declare function Button(props: ButtonProps): ButtonSlots;`,
      },
      {
        type: "p",
        text: fbt(
          "Note the encoding of the rules you have met elsewhere: defaults decide optionality, responsive/`container` blocks decide whether the object form exists and which keys it has, and slots become the return type. In dev, these declarations are served virtually by the TypeScript plugin; `arvia gen` writes them to disk when you want them material.",
          "Docs content — compilation: dts encoding",
        ),
      },
      { type: "h2", text: fbt("Why HMR is instant", "Docs content — heading: why hmr instant") },
      {
        type: "p",
        text: fbt(
          "Put the pieces together: class names do not depend on style content, so editing a padding produces a JS module byte-identical to the previous one. The Vite plugin compares, sees only CSS changed, and swaps the stylesheet through a phantom <file>`.arv`.css module — no JS re-execution, no React re-render, styles update in place.",
          "Docs content — compilation: hmr css only",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Edit the theme file instead and the equation flips: tokens are inlined everywhere (or feed every `var()`), so any file may be stale — the plugin resets its caches and triggers a full reload. Structural component edits (new variant, new slot) change the JS too and update the module graph normally.",
          "Docs content — compilation: hmr theme edits",
        ),
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "Determinism is a design goal: same input, same bytes out, no timestamps. Generated artifacts diff cleanly in CI, and build caches hit reliably.",
          "Docs note — compilation: determinism",
        ),
      },
    ],
  };
}

import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function faq(): DocSection {
  return {
    title: fbt("FAQ & troubleshooting", "Docs page title — FAQ & troubleshooting"),
    slug: "faq",
    description: fbt(
      "The questions everyone hits in their first week, answered precisely.",
      "Docs page description — FAQ and troubleshooting.",
    ),
    blocks: [
      {
        type: "h2",
        text: fbt("My styles don't apply at all", "Docs content — heading: faq no styles"),
      },
      {
        type: "p",
        text: fbt(
          'Almost always: the theme file was never imported. Importing a component file loads its CSS, but global rules and the `--arvia-*` token variables ship with the theme file itself — `import "./theme.arv";` once in your entry point. If a single component looks unstyled instead, check that you put `styles.root` (a string of class names) on the element, not the `styles` object.',
          "Docs content — faq: no styles",
        ),
      },
      {
        type: "h2",
        text: fbt("Imports from .arv are typed as any", "Docs content — heading: faq any"),
      },
      {
        type: "p",
        text: fbt(
          "The TypeScript plugin isn't loaded. Two usual causes: the editor is running its bundled TypeScript instead of the workspace version (in VS Code run “TypeScript: Select TypeScript Version” → workspace), or `@arviahq/typescript-plugin` is missing from `compilerOptions.plugins` in tsconfig. On the command line, use `arvia-tsc` rather than plain `tsc` — tsconfig plugins don't load in stock `tsc`.",
          "Docs content — faq: any types",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "Unknown token errors in every file except the theme",
          "Docs content — heading: faq theme not found",
        ),
      },
      {
        type: "p",
        text: fbt(
          "The shared theme isn't being picked up, so each file is checked against an empty environment. Set `arvia({ theme: \"src/theme.arv\" })` in the Vite config (or move the file to the conventional `src/theme.arv`). In monorepos remember the path is relative to each app's Vite root — every app config points at the theme, even a shared one.",
          "Docs content — faq: theme not found",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "Why is there no <Button> component?",
          "Docs content — heading: faq no component",
        ),
      },
      {
        type: "p",
        text: fbt(
          "By design. Arvia generates styling functions, not UI components — you keep ownership of markup, refs, accessibility, and events, and the same `.arv` file serves React, Preact, Vue, or plain DOM. The pattern is a thin wrapper per framework; see [Components](/docs/components) for the canonical one.",
          "Docs content — faq: no component",
        ),
      },
      {
        type: "h2",
        text: fbt("How do I style with runtime values?", "Docs content — heading: faq dynamic"),
      },
      {
        type: "p",
        text: fbt(
          "Arvia compiles ahead of time, so a value computed at runtime (a user-picked color, a measured width) cannot become a class. Use the platform's escape hatch: set an inline style or a CSS custom property, and keep everything static in the component. The `tokens` export helps mix the two worlds:",
          "Docs content — faq: dynamic values",
        ),
      },
      {
        type: "code",
        label: "ProgressBar.tsx",
        code: `import { ProgressBar } from "./progress.arv";
import { tokens } from "./theme.arv";

const s = ProgressBar();

<div className={s.root}>
  <div
    className={s.fill}
    style={{ width: \`\${percent}%\`, background: accent ?? tokens.color.primary }}
  />
</div>`,
      },
      { type: "h2", text: fbt("Why no boolean variants?", "Docs content — heading: faq boolean") },
      {
        type: "p",
        text: fbt(
          'Two-value axes do the same job with better names: `state { idle {} invalid {} }` reads clearly in source and call site, and leaves room for a third state without an API break. Map your boolean at the call site: `state: invalid ? "invalid" : "idle"`. See [Variants & defaults](/docs/variants).',
          "Docs content — faq: boolean variants",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "My class names changed after I moved a file",
          "Docs content — heading: faq moved file",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Expected: the 6-character hash comes from the file's project-relative path plus the component name (see [How compilation works](/docs/compilation)). Renaming or moving a file gives its components new hashes. Nothing breaks — JS and CSS regenerate together — but don't persist generated class names anywhere (snapshots, analytics selectors); target stable attributes instead.",
          "Docs content — faq: moved file",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "A style overrides my component — or refuses to",
          "Docs content — heading: faq cascade",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Every generated class has the same single-class specificity, so stylesheet order decides ties. The order is deliberate: base → variants → responsive/container → compounds within a component, and standalone `style` declarations after all components (utilities last). If a utility must always win regardless of order, make it win on specificity explicitly — but first ask whether the property belongs in the component as a variant.",
          "Docs content — faq: cascade",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "Two files export the same component name",
          "Docs content — heading: faq collision",
        ),
      },
      {
        type: "p",
        text: fbt(
          "Allowed — hashes keep their CSS apart — and the Vite plugin warns because importing both into one module forces aliasing (`import { Button as IconButton }`). If the warning surprises you, it is usually a copy-pasted file; rename one component.",
          "Docs content — faq: collision",
        ),
      },
      {
        type: "h2",
        text: fbt("Does Arvia work without Vite?", "Docs content — heading: faq without vite"),
      },
      {
        type: "p",
        text: fbt(
          "The compiler is a plain function — `compile(source, options)` from `@arviahq/compiler` returns `{ css, js, dts, diagnostics }` — so any bundler or build script can integrate it; the Vite plugin is ~300 lines you can mirror. First-party support is Vite-only today, and `arvia gen` covers type generation anywhere.",
          "Docs content — faq: without vite",
        ),
      },
      {
        type: "note",
        tone: "tip",
        text: fbt(
          "Not answered here? The [diagnostics reference](/docs/diagnostics) explains every compiler message, and each language page documents its construct's edge cases.",
          "Docs note — faq: more help",
        ),
      },
    ],
  };
}

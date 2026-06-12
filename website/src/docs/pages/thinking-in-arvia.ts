import { fbt } from "fbtee";
import type { DocSection } from "../content";

export function thinkingInArvia(): DocSection {
  return {
    title: fbt("Thinking in Arvia", "Docs page title — Thinking in Arvia"),
    slug: "thinking-in-arvia",
    description: fbt(
      "The mental model: what the compiler does for you, and which construct to reach for.",
      "Docs page description — The mental model behind Arvia.",
    ),
    blocks: [
      {
        type: "p",
        text: fbt(
          "Arvia becomes easy once you internalize one model: an .arv file is not a stylesheet, it is a description of decisions — what tokens exist, what variants a component offers, what changes at a breakpoint. The compiler turns those decisions into CSS classes and a function that picks the right ones. This page builds that model.",
          "Docs content — thinking: opening",
        ),
      },
      {
        type: "h2",
        text: fbt("You author decisions, not classes", "Docs content — heading: decisions"),
      },
      {
        type: "p",
        text: fbt(
          "In hand-written CSS, a button with two sizes and two tones means you invent class names, remember which combine with which, and keep the markup in sync. In Arvia you state the decision space — size is sm or lg, tone is primary or danger — and the compiler derives everything mechanical: the classes, the cascade order, the TypeScript types, the function that maps props to class strings.",
          "Docs content — thinking: decision space",
        ),
      },
      {
        type: "p",
        text: fbt(
          "A useful consequence: invalid combinations are unrepresentable. There is no way to apply a size the component does not declare, misspell a token, or forget the compound rule for small danger buttons — the checker and the generated types catch all three before the browser is involved.",
          "Docs content — thinking: unrepresentable",
        ),
      },
      {
        type: "h2",
        text: fbt("One theme, visible everywhere", "Docs content — heading: one theme"),
      },
      {
        type: "p",
        text: fbt(
          "Arvia has no import statement. Instead, one shared theme file (configured in the Vite plugin, src/theme.arv by convention) forms a global environment: its tokens, recipes, and keyframes are visible to every .arv file in the project. When button.arv says color.primary or use FocusRing, the compiler resolves the name against that environment — that is the whole module system.",
          "Docs content — thinking: shared environment",
        ),
      },
      {
        type: "p",
        text: fbt(
          "This is a deliberate trade. Design tokens are global by nature — a spacing scale that differs per file is a bug, not flexibility. Making the theme ambient removes the import ceremony from every file while keeping references fully checked: an unknown token is a compile error with a did-you-mean suggestion, not a silently broken style.",
          "Docs content — thinking: why ambient",
        ),
      },
      {
        type: "note",
        tone: "info",
        text: fbt(
          "Scoping still exists where it matters: a component's tokens block declares values visible only inside that component, shadowing the theme. Global by default, local by choice.",
          "Docs note — thinking: local tokens exist",
        ),
      },
      {
        type: "h2",
        text: fbt("Choosing the right construct", "Docs content — heading: right construct"),
      },
      {
        type: "p",
        text: fbt(
          "Four constructs produce styles, and they form a ladder of capability. Start at the top and stop as soon as your need is met:",
          "Docs content — thinking: ladder lead-in",
        ),
      },
      {
        type: "table",
        headers: [
          fbt("Reach for", "Docs table header — reach for"),
          fbt("When", "Docs table header — when"),
          fbt("It gives you", "Docs table header — it gives you"),
        ],
        rows: [
          [
            "global",
            fbt(
              "The rule targets the document itself: resets, body typography, third-party class overrides.",
              "Docs table cell — when global",
            ),
            fbt(
              "Raw CSS rules, emitted verbatim with tokens resolved.",
              "Docs table cell — global gives",
            ),
          ],
          [
            "style",
            fbt(
              "One reusable class with no props: a truncation helper, a layout utility.",
              "Docs table cell — when style",
            ),
            fbt(
              "A single hashed class exported as a string constant.",
              "Docs table cell — style gives",
            ),
          ],
          [
            "recipe",
            fbt(
              "A fragment shared across components — focus rings, surfaces — that should not exist as a class of its own.",
              "Docs table cell — when recipe",
            ),
            fbt(
              "Declarations inlined wherever 'use' pulls them in; zero output by itself.",
              "Docs table cell — recipe gives",
            ),
          ],
          [
            "component",
            fbt(
              "Anything with props: variants, multiple styled elements (slots), responsive or compound behavior.",
              "Docs table cell — when component",
            ),
            fbt(
              "A typed function returning one class string per slot.",
              "Docs table cell — component gives",
            ),
          ],
        ],
      },
      {
        type: "p",
        text: fbt(
          "Two common graduations: a style that wants a second visual flavor becomes a component with one variant; a clump of declarations copy-pasted between two components becomes a recipe. The compiler nudges you — putting variants inside a style is an error whose message says to use a component.",
          "Docs content — thinking: graduations",
        ),
      },
      {
        type: "h2",
        text: fbt(
          "Variant or compound? Token or local token?",
          "Docs content — heading: finer choices",
        ),
      },
      {
        type: "ul",
        items: [
          fbt(
            "A variant is an axis callers choose (size, tone). A compound block is extra styling for a specific combination of axes — it adds no props, it refines existing ones.",
            "Docs list item — variant vs compound",
          ),
          fbt(
            "A theme token is a system-wide decision (your spacing scale). A local token is a component implementation detail (this chip's exact pill radius) — real values with names, but no global footprint.",
            "Docs list item — theme vs local token",
          ),
          fbt(
            "A responsive block follows the viewport; a container block follows the component's own rendered width. Prefer containers for anything that can appear in both a sidebar and a main column.",
            "Docs list item — responsive vs container",
          ),
        ],
      },
      { type: "h2", text: fbt("Trust the output", "Docs content — heading: trust the output") },
      {
        type: "p",
        text: fbt(
          "Because class names are hashed from the file path and component name — never from the style content — editing a padding value changes only the CSS, byte-for-byte leaving the JS alone. That is why dev-server updates are instant CSS swaps, and why the generated output stays diffable and predictable in production. When you want to see exactly what you shipped, read How compilation works.",
          "Docs content — thinking: trust output",
        ),
      },
    ],
  };
}

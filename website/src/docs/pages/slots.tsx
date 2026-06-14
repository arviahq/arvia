import { DocArticle } from "../../components/docs/DocArticle";
import { DocH2 } from "../../components/docs/DocH2";
import { DocP } from "../../components/docs/DocP";
import { DocCallout } from "../../components/docs/DocCallout";
import { DocCode } from "../../components/docs/DocCode";
import type { DocPageMeta } from "../registry";

export const slotsMeta: DocPageMeta = {
  slug: "slots",
  title: <fbt desc="Docs page title — Slots">{"Slots"}</fbt>,
  description: (
    <fbt desc="Docs page description — Multi-part components.">
      {"Give each part of a component its own class."}
    </fbt>
  ),
  nav: { section: "language", order: 6 },
  searchText:
    "When a component has several parts declare them as slots. Name-only registration uses a semicolon: icon; Rules go in braces: label { font-weight: 500; } Empty icon {} is invalid. Slot rules can also live in base variants and compound and merge per slot. component Button { slots { icon; label { font-weight: 500; } } base { display: inline-flex; icon { flex-shrink: 0; } } } const s = Button(); root is always present. Related: Components, States, Compound variants.",
};

export function SlotsPage() {
  return (
    <DocArticle meta={slotsMeta}>
      <DocP>
        <fbt desc="Docs content — slots: what">
          {
            "When a component has several parts — an icon and a label, a header and a body — declare them as `slots`. Each gets its own generated class."
          }
        </fbt>
      </DocP>
      <DocH2>
        <fbt desc="Docs content — heading: declaring slots">{"Declaring slots"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: declare">
          {
            "Register a part with `name;`. When the slot's styles belong in the slots block, use a block instead — declarations, `use`, and `&` states are all allowed:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`component Button {
  slots {
    icon;
    label { font-weight: 500; }
  }

  base {
    display: inline-flex;
    align-items: center;
    gap: space.2;
    icon { flex-shrink: 0; }
  }
}`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — slots: semicolon vs braces">
          {
            "`icon;` is name-only registration. `icon { … }` attaches rules. An empty `icon {}` is invalid — use the semicolon form when there is nothing to put inside the block."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: rules elsewhere">{"Rules in other blocks"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: merge">
          {
            "The same `icon { … }` syntax works in `base`, variant values, and `compound`. Styles for a slot merge no matter where you write them — layout on `root` in `base`, part-specific rules wherever reads best:"
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`  variants {
    size {
      lg { icon { width: 20px; height: 20px; } }
    }
  }

  compound {
    size: sm;
    tone: danger;
    root { font-weight: 700; }
  }`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: per-slot states">{"Per-slot states"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: states">
          {
            "States on a slot target that slot's element. Cross-slot styling — restyling `icon` when `root` is hovered — lives in `base` or variant bodies; see [States](/docs/states)."
          }
        </fbt>
      </DocP>
      <DocCode
        label={"src/button.arv"}
        code={`  slots {
    icon {
      transition: transform duration.fast;
      &:hover { transform: scale(1.05); }
    }
  }`}
      />
      <DocH2>
        <fbt desc="Docs content — heading: usage">{"Usage"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: usage">
          {"The function returns one class per slot. Put each on the matching element:"}
        </fbt>
      </DocP>
      <DocCode
        label={"App.tsx"}
        code={`const s = Button();

<button className={s.root}>
  <span className={s.icon}>★</span>
  <span className={s.label}>Save</span>
</button>;`}
      />
      <DocCallout tone="info">
        <fbt desc="Docs note — slots: decoupled">
          {
            "`root` is always present even if you don't declare it. A slot is just a class — you choose which element gets it, and you can skip a slot entirely (an icon-less button never uses `s.icon`)."
          }
        </fbt>
      </DocCallout>
      <DocH2>
        <fbt desc="Docs content — heading: related">{"Related"}</fbt>
      </DocH2>
      <DocP>
        <fbt desc="Docs content — slots: related">
          {
            "[Components](/docs/components) · [States](/docs/states) for cross-slot hover · [Compound variants](/docs/compound) · [Variants](/docs/variants)."
          }
        </fbt>
      </DocP>
    </DocArticle>
  );
}

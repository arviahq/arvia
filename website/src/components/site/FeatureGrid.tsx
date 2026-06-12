import { FeatureCard } from "../feature-card.arv";
import { Grid } from "../layout.arv";
import { FeatureIcon } from "./FeatureIcon";

export function FeatureGrid() {
  const grid = Grid();
  const items = [
    {
      icon: (
        <FeatureIcon>
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — zero runtime CSS">{"Zero runtime CSS"}</fbt>,
      body: (
        <fbt desc="Feature card body — compile-time styles">
          {"Styles compile at build time. No style recalculation in the browser."}
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — typed variants">{"Typed variants"}</fbt>,
      body: (
        <fbt desc="Feature card body — variant autocomplete">
          {"Autocomplete for every variant prop. Catch invalid combinations early."}
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — design tokens">{"Design tokens"}</fbt>,
      body: (
        <fbt desc="Feature card body — token system">
          {"Themes, modes, breakpoints, and container tokens — all first-class."}
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <path d="M12 2 2 7l10 5 10-5-10-5z" />
          <path d="M2 12l10 5 10-5" />
          <path d="M2 17l10 5 10-5" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — slots and recipes">{"Slots & recipes"}</fbt>,
      body: (
        <fbt desc="Feature card body — composition">
          {"Multi-part components and reusable style fragments with use."}
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <rect x="2" y="4" width="13" height="10" rx="2" />
          <rect x="17" y="9" width="5" height="11" rx="1.5" />
          <path d="M6 18h5" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — responsive layout">{"Responsive & containers"}</fbt>,
      body: (
        <fbt desc="Feature card body — responsive variants">
          {"Breakpoint and container-query variants with object props."}
        </fbt>
      ),
    },
    {
      icon: (
        <FeatureIcon>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </FeatureIcon>
      ),
      title: <fbt desc="Feature card title — toolchain">{"Full toolchain"}</fbt>,
      body: (
        <fbt desc="Feature card body — developer tools">
          {"Vite plugin, LSP, Storybook generator, and token documentation."}
        </fbt>
      ),
    },
  ];

  return (
    <div className={grid.root}>
      {items.map((item, i) => {
        const card = FeatureCard();
        return (
          <div key={i} className={card.root}>
            <span className={card.icon}>{item.icon}</span>
            <p className={card.title}>{item.title}</p>
            <p className={card.body}>{item.body}</p>
          </div>
        );
      })}
    </div>
  );
}

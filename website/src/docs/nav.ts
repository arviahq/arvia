import { fbt } from "fbtee";

/** Docs sidebar labels — extracted strings for fbtee translation. */
export function getDocNav() {
  return [
    {
      section: fbt("Getting started", "Docs sidebar section title"),
      items: [
        {
          title: fbt("Introduction", "Docs nav item"),
          slug: "introduction",
        },
        {
          title: fbt("Installation", "Docs nav item"),
          slug: "installation",
        },
        {
          title: fbt("Quick start", "Docs nav item"),
          slug: "quick-start",
        },
      ],
    },
    {
      section: fbt("Language", "Docs sidebar section title"),
      items: [
        { title: fbt("Theme & tokens", "Docs nav item"), slug: "theme" },
        { title: fbt("Theme modes", "Docs nav item"), slug: "theme-modes" },
        { title: fbt("Global styles", "Docs nav item"), slug: "global" },
        { title: fbt("Recipes", "Docs nav item"), slug: "recipes" },
        { title: fbt("Styles", "Docs nav item"), slug: "styles" },
        { title: fbt("Components", "Docs nav item"), slug: "components" },
        { title: fbt("Slots", "Docs nav item"), slug: "slots" },
        { title: fbt("Local tokens", "Docs nav item"), slug: "local-tokens" },
        { title: fbt("Variants & defaults", "Docs nav item"), slug: "variants" },
        { title: fbt("Compound variants", "Docs nav item"), slug: "compound" },
        { title: fbt("States", "Docs nav item"), slug: "states" },
        { title: fbt("Responsive", "Docs nav item"), slug: "responsive" },
        { title: fbt("Container queries", "Docs nav item"), slug: "container-queries" },
        { title: fbt("Keyframes", "Docs nav item"), slug: "keyframes" },
        { title: fbt("Token docs", "Docs nav item"), slug: "token-docs" },
      ],
    },
    {
      section: fbt("Tooling", "Docs sidebar section title"),
      items: [
        { title: fbt("Packages", "Docs nav item"), slug: "packages" },
        { title: fbt("Vite plugin", "Docs nav item"), slug: "vite-plugin" },
        { title: fbt("CLI", "Docs nav item"), slug: "cli" },
        { title: fbt("Language server", "Docs nav item"), slug: "language-server" },
        { title: fbt("Storybook", "Docs nav item"), slug: "storybook" },
      ],
    },
  ];
}

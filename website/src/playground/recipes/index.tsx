import compoundSource from "./compound.arv?raw";
import containerSource from "./container.arv?raw";
import cssSource from "./css.arv?raw";
import implicitRootSource from "./implicit-root.arv?raw";
import keyframesSource from "./keyframes.arv?raw";
import localTokensSource from "./local-tokens.arv?raw";
import recipeNestedSource from "./recipe-nested.arv?raw";
import responsiveSource from "./responsive.arv?raw";
import slotsSource from "./slots.arv?raw";
import statesSource from "./states.arv?raw";
import styleDeclSource from "./style-decl.arv?raw";
import tokensSource from "./tokens.arv?raw";
import useRecipeSource from "./use-recipe.arv?raw";
import type { ReactNode } from "react";
import variantsSource from "./variants.arv?raw";

export type RecipeEntry = {
  id: string;
  file: string;
  title: ReactNode;
  source: string;
};

export function getRecipes(): RecipeEntry[] {
  return [
    {
      id: "tokens",
      file: "tokens.arv",
      title: <fbt desc="Playground recipe title">{"Theme tokens"}</fbt>,
      source: tokensSource,
    },
    {
      id: "implicit-root",
      file: "implicit-root.arv",
      title: <fbt desc="Playground recipe title">{"Implicit root slot"}</fbt>,
      source: implicitRootSource,
    },
    {
      id: "slots",
      file: "slots.arv",
      title: <fbt desc="Playground recipe title">{"Slots"}</fbt>,
      source: slotsSource,
    },
    {
      id: "variants",
      file: "variants.arv",
      title: <fbt desc="Playground recipe title">{"Variants & defaults"}</fbt>,
      source: variantsSource,
    },
    {
      id: "compound",
      file: "compound.arv",
      title: <fbt desc="Playground recipe title">{"Compound variants"}</fbt>,
      source: compoundSource,
    },
    {
      id: "states",
      file: "states.arv",
      title: <fbt desc="Playground recipe title">{"Pseudo states"}</fbt>,
      source: statesSource,
    },
    {
      id: "use-recipe",
      file: "use-recipe.arv",
      title: <fbt desc="Playground recipe title">{"use recipe"}</fbt>,
      source: useRecipeSource,
    },
    {
      id: "recipe-nested",
      file: "recipe-nested.arv",
      title: <fbt desc="Playground recipe title">{"Nested recipes"}</fbt>,
      source: recipeNestedSource,
    },
    {
      id: "keyframes",
      file: "keyframes.arv",
      title: <fbt desc="Playground recipe title">{"Keyframes"}</fbt>,
      source: keyframesSource,
    },
    {
      id: "style-decl",
      file: "style-decl.arv",
      title: <fbt desc="Playground recipe title">{"Styles (exported class)"}</fbt>,
      source: styleDeclSource,
    },
    {
      id: "local-tokens",
      file: "local-tokens.arv",
      title: <fbt desc="Playground recipe title">{"Local tokens"}</fbt>,
      source: localTokensSource,
    },
    {
      id: "css",
      file: "css.arv",
      title: <fbt desc="Playground recipe title">{"CSS & at-rules"}</fbt>,
      source: cssSource,
    },
    {
      id: "responsive",
      file: "responsive.arv",
      title: <fbt desc="Playground recipe title">{"Responsive"}</fbt>,
      source: responsiveSource,
    },
    {
      id: "container",
      file: "container.arv",
      title: <fbt desc="Playground recipe title">{"Container queries"}</fbt>,
      source: containerSource,
    },
  ];
}

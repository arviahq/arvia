import { createLocaleContext } from "fbtee";
import { getStoredLocale, type SiteLocale } from "../preferences";

export const availableLanguages = new Map<SiteLocale, string>([
  ["en_US", "English"],
  ["fr_FR", "Français"],
  ["es_ES", "Español"],
  ["de_DE", "Deutsch"],
  ["pt_PT", "Português"],
]);

function clientLocales(): string[] {
  const stored = getStoredLocale();
  const browser =
    typeof navigator === "undefined" ? ["en_US"] : [navigator.language, ...navigator.languages];
  return stored ? [stored, ...browser] : browser;
}

async function loadLocale(locale: string) {
  switch (locale) {
    case "fr_FR":
      return (await import("../translations/fr_FR.json")).default.fr_FR;
    case "es_ES":
      return (await import("../translations/es_ES.json")).default.es_ES;
    case "de_DE":
      return (await import("../translations/de_DE.json")).default.de_DE;
    case "pt_PT":
      return (await import("../translations/pt_PT.json")).default.pt_PT;
    default:
      return {};
  }
}

export const LocaleContext = createLocaleContext({
  availableLanguages,
  clientLocales: clientLocales(),
  loadLocale,
});

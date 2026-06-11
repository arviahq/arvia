export type SiteTheme = "light" | "dark";

export type SiteLocale = "en_US" | "fr_FR" | "es_ES" | "de_DE" | "pt_PT";

const THEME_KEY = "arvia-site-theme";
const LOCALE_KEY = "arvia-site-locale";

export function getStoredTheme(): SiteTheme | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: SiteTheme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private browsing or storage disabled.
  }
}

export function getStoredLocale(): SiteLocale | null {
  try {
    const value = localStorage.getItem(LOCALE_KEY);
    if (
      value === "en_US" ||
      value === "fr_FR" ||
      value === "es_ES" ||
      value === "de_DE" ||
      value === "pt_PT"
    ) {
      return value;
    }
    return null;
  } catch {
    return null;
  }
}

export function setStoredLocale(locale: SiteLocale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Private browsing or storage disabled.
  }
}

export function localeToHtmlLang(locale: SiteLocale): string {
  switch (locale) {
    case "fr_FR":
      return "fr";
    case "es_ES":
      return "es";
    case "de_DE":
      return "de";
    case "pt_PT":
      return "pt";
    default:
      return "en";
  }
}

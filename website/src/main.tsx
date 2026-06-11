import "./theme.arv";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { useLocaleContext } from "fbtee";
import { App } from "./App";
import { LocaleContext } from "./i18n/locale-context";
import { getStoredTheme, localeToHtmlLang, setStoredLocale, type SiteLocale } from "./preferences";
import { setTheme } from "./arvia-theme";

function Root() {
  const { locale, setLocale } = useLocaleContext();

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme ?? "dark");
  }, []);

  useEffect(() => {
    document.documentElement.lang = localeToHtmlLang(locale as SiteLocale);
    setStoredLocale(locale as SiteLocale);
  }, [locale]);

  return (
    <BrowserRouter>
      <App locale={locale as SiteLocale} onLocaleChange={setLocale} />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleContext>
      <Root />
    </LocaleContext>
  </StrictMode>,
);

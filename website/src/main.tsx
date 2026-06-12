import "./theme.arv";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { useLocaleContext } from "fbtee";
import { LocaleContext } from "./i18n/locale-context";
import { localeToHtmlLang, setStoredLocale, type SiteLocale } from "./preferences";
import { setTheme } from "./arvia-theme";
import { getStoredTheme } from "./preferences";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function Root() {
  const { locale } = useLocaleContext();

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme ?? "dark");
  }, []);

  useEffect(() => {
    document.documentElement.lang = localeToHtmlLang(locale as SiteLocale);
    setStoredLocale(locale as SiteLocale);
  }, [locale]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleContext>
      <Root />
    </LocaleContext>
  </StrictMode>,
);

import { useEffect, useState } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useLocaleContext } from "fbtee";
import { SiteFooter } from "../components/site/SiteFooter";
import { SiteNav } from "../components/site/SiteNav";
import { DocsSearchProvider } from "../components/DocsSearch";
import { SiteThemeProvider } from "../site-theme";
import { getStoredTheme, setStoredTheme, type SiteLocale, type SiteTheme } from "../preferences";
import { setTheme } from "../arvia-theme";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { locale, setLocale } = useLocaleContext();
  const [theme, setThemeState] = useState<SiteTheme>(() => getStoredTheme() ?? "dark");

  useEffect(() => {
    setTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  function toggleTheme() {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <SiteThemeProvider theme={theme}>
      <DocsSearchProvider>
        <SiteNav
          locale={locale as SiteLocale}
          onLocaleChange={setLocale}
          onThemeToggle={toggleTheme}
          theme={theme}
        />
        <Outlet />
        <SiteFooter />
      </DocsSearchProvider>
    </SiteThemeProvider>
  );
}

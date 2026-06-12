import { useEffect, useState } from "react";
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
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
  // The playground is an edge-to-edge IDE — no footer below it.
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPlayground = pathname === "/playground";

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
        <div
          style={
            isPlayground
              ? { display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }
              : undefined
          }
        >
          <SiteNav
            locale={locale as SiteLocale}
            onLocaleChange={setLocale}
            onThemeToggle={toggleTheme}
            theme={theme}
          />
          <Outlet />
          {isPlayground ? null : <SiteFooter />}
        </div>
      </DocsSearchProvider>
    </SiteThemeProvider>
  );
}

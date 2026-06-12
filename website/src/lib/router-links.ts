type AppTo = "/" | "/playground" | "/docs/$slug";

export function appLink(to: string, params?: { slug: string }) {
  if (to === "/" || to === "/playground") {
    return { to: to as AppTo };
  }
  const match = to.match(/^\/docs\/(.+)$/);
  if (match) {
    return { to: "/docs/$slug" as const, params: { slug: match[1]! } };
  }
  if (to === "/docs/$slug" && params?.slug) {
    return { to: "/docs/$slug" as const, params: { slug: params.slug } };
  }
  throw new Error(`Unsupported route: ${to}`);
}

/** Generate a prefetch link for a docs page by slug */
export function preloadPage(slug: string) {
  return {
    href: `/docs/${slug}`,
    rel: "prefetch" as const,
  };
}

/** Generate a prefetch link for the search API endpoint */
export function preloadSearch() {
  return {
    href: "/api/search",
    rel: "prefetch" as const,
  };
}

/** Default configuration for preload behavior */
export const preloadConfig = {
  hoverDelay: 65,
  intersectionThreshold: 0.1,
  maxPreloads: 5,
};

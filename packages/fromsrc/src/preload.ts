export function preloadPage(slug: string) {
  return {
    href: `/docs/${slug}`,
    rel: "prefetch" as const,
  };
}

export function preloadSearch() {
  return {
    href: "/api/search",
    rel: "prefetch" as const,
  };
}

export const preloadConfig = {
  hoverDelay: 65,
  intersectionThreshold: 0.1,
  maxPreloads: 5,
};

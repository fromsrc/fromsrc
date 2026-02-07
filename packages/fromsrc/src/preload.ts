export function preloadPage(slug: string) {
	return {
		rel: "prefetch" as const,
		href: `/docs/${slug}`,
	}
}

export function preloadSearch() {
	return {
		rel: "prefetch" as const,
		href: "/api/search",
	}
}

export const preloadConfig = {
	hoverDelay: 65,
	intersectionThreshold: 0.1,
	maxPreloads: 5,
}

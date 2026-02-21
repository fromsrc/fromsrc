function normalize(url: string): string {
	const value = url.trim()
	if (!value) return "https://fromsrc.com"
	return value.endsWith("/") ? value.slice(0, -1) : value
}

export function siteurl(): string {
	return normalize(process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://fromsrc.com")
}


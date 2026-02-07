export type OgImageConfig = {
	title: string
	description?: string
	siteName?: string
	logo?: string
	theme?: "light" | "dark"
	accentColor?: string
	width?: number
	height?: number
}

export type OgImageMeta = {
	url: string
	width: number
	height: number
	alt: string
	type: string
}

export function ogImageUrl(base: string, params: Record<string, string | undefined>): string {
	const url = new URL(base)
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			url.searchParams.set(key, value)
		}
	}
	return url.toString()
}

export function generateOgMeta(base: string, config: OgImageConfig): OgImageMeta {
	const width = config.width ?? 1200
	const height = config.height ?? 630
	const url = ogImageUrl(base, {
		title: config.title,
		description: config.description,
		siteName: config.siteName,
		logo: config.logo,
		theme: config.theme,
		accentColor: config.accentColor,
		width: String(width),
		height: String(height),
	})
	return {
		url,
		width,
		height,
		alt: config.description ?? config.title,
		type: "image/png",
	}
}

export function defaultTemplate(config: OgImageConfig) {
	const dark = config.theme === "dark"
	return {
		title: config.title,
		description: config.description ?? "",
		siteName: config.siteName ?? "",
		logo: config.logo ?? "",
		width: config.width ?? 1200,
		height: config.height ?? 630,
		colors: {
			background: dark ? "#0a0a0a" : "#ffffff",
			foreground: dark ? "#fafafa" : "#0a0a0a",
			muted: dark ? "#a1a1aa" : "#71717a",
			accent: config.accentColor ?? (dark ? "#3b82f6" : "#2563eb"),
		},
	}
}

type MetaTag = { property: string; content: string } | { name: string; content: string }

export function socialMeta(config: OgImageConfig & { url: string }): MetaTag[] {
	const width = config.width ?? 1200
	const height = config.height ?? 630
	const alt = config.description ?? config.title
	return [
		{ property: "og:image", content: config.url },
		{ property: "og:image:width", content: String(width) },
		{ property: "og:image:height", content: String(height) },
		{ property: "og:image:alt", content: alt },
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:image", content: config.url },
	]
}

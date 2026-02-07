export interface SeoConfig {
	baseUrl: string
	siteName: string
	titleTemplate?: string
	defaultImage?: string
	twitter?: string
	locale?: string
}

export interface PageSeo {
	title: string
	description?: string
	path: string
	image?: string
	type?: "article" | "website"
	publishedAt?: string
	modifiedAt?: string
	noindex?: boolean
}

export function createSeo(config: SeoConfig) {
	const locale = config.locale ?? "en_US"
	const template = config.titleTemplate ?? "%s"

	function title(page: PageSeo): string {
		return template.replace("%s", page.title)
	}

	function canonical(page: PageSeo): string {
		const base = config.baseUrl.replace(/\/$/, "")
		const path = page.path.startsWith("/") ? page.path : `/${page.path}`
		return `${base}${path}`
	}

	function meta(page: PageSeo): Record<string, string>[] {
		const url = canonical(page)
		const formatted = title(page)
		const image = page.image ?? config.defaultImage
		const type = page.type ?? "article"

		const tags: Record<string, string>[] = [
			{ property: "og:title", content: formatted },
			{ property: "og:url", content: url },
			{ property: "og:type", content: type },
			{ property: "og:site_name", content: config.siteName },
			{ property: "og:locale", content: locale },
			{ name: "twitter:card", content: "summary_large_image" },
		]

		if (page.description) {
			tags.unshift({ name: "description", content: page.description })
			tags.push({ property: "og:description", content: page.description })
		}

		if (image) {
			tags.push({ property: "og:image", content: image })
		}

		if (config.twitter) {
			tags.push({ name: "twitter:site", content: config.twitter })
		}

		if (page.noindex) {
			tags.push({ name: "robots", content: "noindex,nofollow" })
		}

		return tags
	}

	function jsonLd(page: PageSeo): object {
		const data: Record<string, unknown> = {
			"@context": "https://schema.org",
			"@type": "TechArticle",
			headline: title(page),
			url: canonical(page),
			publisher: {
				"@type": "Organization",
				name: config.siteName,
			},
		}

		if (page.description) {
			data.description = page.description
		}

		const image = page.image ?? config.defaultImage
		if (image) {
			data.image = image
		}

		if (page.publishedAt) {
			data.datePublished = page.publishedAt
		}

		if (page.modifiedAt) {
			data.dateModified = page.modifiedAt
		}

		return data
	}

	return { meta, jsonLd, canonical, title }
}

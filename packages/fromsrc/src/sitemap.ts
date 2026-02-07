import type { DocMeta } from "./content"

export interface SitemapConfig {
	baseUrl: string
	docsPrefix?: string
}

export interface SitemapEntry {
	url: string
	lastmod?: string
	changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
	priority?: number
}

function escape(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

function urlEntry(entry: SitemapEntry): string {
	let xml = `\t<url>\n\t\t<loc>${escape(entry.url)}</loc>`
	if (entry.lastmod) xml += `\n\t\t<lastmod>${escape(entry.lastmod)}</lastmod>`
	if (entry.changefreq) xml += `\n\t\t<changefreq>${entry.changefreq}</changefreq>`
	if (entry.priority !== undefined) xml += `\n\t\t<priority>${entry.priority}</priority>`
	xml += "\n\t</url>"
	return xml
}

export function generateSitemap(config: SitemapConfig, entries: SitemapEntry[]): string {
	const urls = entries.map(urlEntry).join("\n")
	return [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		urls,
		`</urlset>`,
	].join("\n")
}

export function generateSitemapIndex(baseUrl: string, sitemaps: string[]): string {
	const entries = sitemaps
		.map((url) => `\t<sitemap>\n\t\t<loc>${escape(`${baseUrl}${url}`)}</loc>\n\t</sitemap>`)
		.join("\n")
	return [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		entries,
		`</sitemapindex>`,
	].join("\n")
}

export function entriesToRss(
	config: { title: string; description: string; baseUrl: string; link: string },
	entries: SitemapEntry[],
): string {
	const items = entries
		.map(
			(e) =>
				`\t\t<item>\n\t\t\t<link>${escape(e.url)}</link>${e.lastmod ? `\n\t\t\t<pubDate>${escape(e.lastmod)}</pubDate>` : ""}\n\t\t</item>`,
		)
		.join("\n")
	return [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<rss version="2.0">`,
		`\t<channel>`,
		`\t\t<title>${escape(config.title)}</title>`,
		`\t\t<description>${escape(config.description)}</description>`,
		`\t\t<link>${escape(config.link)}</link>`,
		items,
		`\t</channel>`,
		`</rss>`,
	].join("\n")
}

function depth(slug: string): number {
	if (slug === "") return 0
	return slug.split("/").length
}

export function docsToEntries(config: SitemapConfig, docs: DocMeta[]): SitemapEntry[] {
	const prefix = config.docsPrefix ?? "/docs"
	return docs.map((doc) => {
		const d = depth(doc.slug)
		const priority = d === 0 ? 1.0 : d === 1 ? 0.8 : d === 2 ? 0.6 : 0.4
		const url = `${config.baseUrl}${prefix}${doc.slug ? `/${doc.slug}` : ""}`
		return { url, priority }
	})
}

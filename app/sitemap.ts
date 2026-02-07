import { getAllDocs } from "fromsrc"
import type { MetadataRoute } from "next"
import { join } from "node:path"

const base = "https://fromsrc.com"
const docsDir = join(process.cwd(), "docs")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const docs = await getAllDocs(docsDir)

	const docEntries: MetadataRoute.Sitemap = docs.map((doc) => ({
		url: `${base}/docs${doc.slug ? `/${doc.slug}` : ""}`,
		lastModified: new Date(),
		changeFrequency: doc.slug.startsWith("api/") ? "weekly" : "monthly",
		priority: doc.slug === "" ? 0.9 : doc.slug.startsWith("components/") ? 0.7 : 0.8,
	}))

	return [
		{ url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
		...docEntries,
	]
}

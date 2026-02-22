import { getAllDocs, getDoc } from "@/app/docs/_lib/content"
import { calcReadTime } from "fromsrc"
import { sendjson } from "@/app/api/_lib/json"

const cache = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

export async function GET(request: Request) {
	const metas = await getAllDocs()
	const docs = await Promise.all(metas.map((m) => getDoc(m.slug ? m.slug.split("/") : [])))
	const valid = docs.filter((doc): doc is NonNullable<(typeof docs)[number]> => doc !== null)

	let words = 0
	let readTime = 0
	const categories: Record<string, number> = {}

	for (const doc of valid) {
		const count = doc.content.split(/\s+/).filter(Boolean).length
		words += count
		readTime += calcReadTime(doc.content)
		const category = doc.slug.split("/")[0] || "root"
		categories[category] = (categories[category] || 0) + 1
	}

	return sendjson(request, { pages: valid.length, words, readTime, categories }, cache)
}

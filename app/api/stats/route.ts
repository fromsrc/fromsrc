import { getAllDocs, getDoc } from "@/app/docs/_lib/content"
import { calcReadTime } from "fromsrc"

export async function GET() {
	const metas = await getAllDocs()
	const docs = await Promise.all(metas.map((m) => getDoc(m.slug ? m.slug.split("/") : [])))
	const valid = docs.filter(Boolean)

	let words = 0
	let readTime = 0
	const categories: Record<string, number> = {}

	for (const doc of valid) {
		const count = doc!.content.split(/\s+/).filter(Boolean).length
		words += count
		readTime += calcReadTime(doc!.content)
		const category = doc!.slug.split("/")[0] || "root"
		categories[category] = (categories[category] || 0) + 1
	}

	return Response.json(
		{ pages: valid.length, words, readTime, categories },
		{ headers: { "Cache-Control": "public, max-age=3600" } },
	)
}

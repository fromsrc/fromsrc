import { localSearch, z } from "fromsrc"
import { getAllDocs, getSearchDocs } from "@/app/docs/_lib/content"

const schema = z.object({
	q: z.string().trim().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(50).default(8),
})

interface entry {
	at: number
	value: unknown
}

const cache = new Map<string, entry>()
const ttl = 1000 * 60 * 5
const max = 200

function get(key: string): unknown | null {
	const item = cache.get(key)
	if (!item) return null
	if (Date.now() - item.at > ttl) {
		cache.delete(key)
		return null
	}
	return item.value
}

function set(key: string, value: unknown): unknown {
	if (cache.size >= max) {
		const oldest = cache.keys().next().value
		if (oldest) cache.delete(oldest)
	}
	cache.set(key, { at: Date.now(), value })
	return value
}

export async function GET(request: Request) {
	const url = new URL(request.url)
	const values = schema.parse({
		q: url.searchParams.get("q") ?? undefined,
		limit: url.searchParams.get("limit") ?? undefined,
	})
	const query = values.q?.toLowerCase() ?? ""
	const key = `${query}::${values.limit}`
	const cached = get(key)
	if (cached) return Response.json(cached)

	if (!values.q) {
		const docs = await getAllDocs()
		return Response.json(set(key, docs.slice(0, values.limit)))
	}

	const docs = await getSearchDocs()
	const results = localSearch.search(values.q, docs).slice(0, values.limit)
	return Response.json(
		set(
			key,
			results.map((result) => ({
				slug: result.doc.slug,
				title: result.doc.title,
				description: result.doc.description,
				snippet: result.snippet,
				anchor: result.anchor,
				score: result.score,
			})),
		),
	)
}

import { localSearch, z } from "fromsrc"
import { getAllDocs, getSearchDocs } from "@/app/docs/_lib/content"

const schema = z.object({
	q: z.preprocess(
		(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
		z.string().trim().min(1).optional(),
	),
	limit: z.coerce.number().int().min(1).max(50).default(8),
})

interface entry {
	at: number
	value: unknown
}

const cache = new Map<string, entry>()
const inflight = new Map<string, Promise<unknown>>()
const ttl = 1000 * 60 * 5
const max = 200
const headers = { "cache-control": "public, max-age=60, s-maxage=300" }

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

async function compute(query: string | undefined, limit: number): Promise<unknown> {
	if (!query) {
		const docs = await getAllDocs()
		return docs.slice(0, limit).map((doc) => ({
			slug: doc.slug,
			title: doc.title,
			description: doc.description,
			snippet: undefined,
			anchor: undefined,
			score: 0,
		}))
	}
	const docs = await getSearchDocs()
	return localSearch.search(query, docs, limit).map((result) => ({
		slug: result.doc.slug,
		title: result.doc.title,
		description: result.doc.description,
		snippet: result.snippet,
		anchor: result.anchor,
		score: result.score,
	}))
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
	if (cached) return Response.json(cached, { headers })

	const pending = inflight.get(key) ?? compute(values.q, values.limit)
	if (!inflight.has(key)) inflight.set(key, pending)
	const results = await pending.finally(() => {
		if (inflight.get(key) === pending) inflight.delete(key)
	})
	return Response.json(
		set(key, results),
		{ headers },
	)
}

import { localSearch, z } from "fromsrc"
import { sendjson, sendjsonwithheaders } from "@/app/api/_lib/json"
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
	value: row[]
}

interface row {
	slug: string
	title: string
	description?: string
	snippet?: string
	anchor?: string
	heading?: string
	score: number
}

const cache = new Map<string, entry>()
const inflight = new Map<string, Promise<row[]>>()
const ttl = 1000 * 60 * 5
const max = 200
const cachecontrol = "public, max-age=60, s-maxage=300, stale-while-revalidate=86400"

function normalize(text: string | undefined): string {
	return text?.toLowerCase().replace(/\s+/g, " ").trim() ?? ""
}

function get(key: string): row[] | null {
	const item = cache.get(key)
	if (!item) return null
	if (Date.now() - item.at > ttl) {
		cache.delete(key)
		return null
	}
	return item.value
}

function set(key: string, value: row[]): row[] {
	if (cache.size >= max) {
		const oldest = cache.keys().next().value
		if (oldest) cache.delete(oldest)
	}
	cache.set(key, { at: Date.now(), value })
	return value
}

async function compute(query: string | undefined, limit: number): Promise<row[]> {
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
		heading: result.heading,
		score: result.score,
	}))
}

export async function GET(request: Request) {
	const started = performance.now()
	const url = new URL(request.url)
	const parsed = schema.safeParse({
		q: url.searchParams.get("q") ?? undefined,
		limit: url.searchParams.get("limit") ?? undefined,
	})
	if (!parsed.success) return sendjson(request, [], cachecontrol, 400)
	const values = parsed.data
	const query = normalize(values.q)
	const key = `${query}::${values.limit}`
	const cached = get(key)
	if (cached) {
		const duration = performance.now() - started
		return sendjsonwithheaders(
			request,
			cached,
			cachecontrol,
			{
				"Server-Timing": `search;dur=${duration.toFixed(2)}`,
				"X-Search-Cache": "hit",
				"X-Search-Result-Count": String(cached.length),
			},
		)
	}

	const pending = inflight.get(key) ?? compute(values.q, values.limit)
	if (!inflight.has(key)) inflight.set(key, pending)
	const results = await pending.finally(() => {
		if (inflight.get(key) === pending) inflight.delete(key)
	})
	const duration = performance.now() - started
	return sendjsonwithheaders(
		request,
		set(key, results),
		cachecontrol,
		{
			"Server-Timing": `search;dur=${duration.toFixed(2)}`,
			"X-Search-Cache": "miss",
			"X-Search-Result-Count": String(results.length),
		},
	)
}

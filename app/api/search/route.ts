import { localSearch, z } from "fromsrc"
import { searchmaxquery } from "fromsrc/searchpolicy"
import { sendjson, sendjsonwithheaders } from "@/app/api/_lib/json"
import { getAllDocs, getSearchDocs } from "@/app/docs/_lib/content"

const schema = z.object({
	q: z.preprocess(
		(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
		z.string().trim().min(1).max(searchmaxquery).optional(),
	),
	limit: z.coerce.number().int().min(1).max(50).default(8),
})

interface entry {
	at: number
	value: row[]
}

interface cacheentry<T> {
	at: number
	value: T
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

interface computev {
	rows: row[]
	docsHit: boolean
}

const cache = new Map<string, entry>()
const inflight = new Map<string, Promise<computev>>()
let allCache: cacheentry<Awaited<ReturnType<typeof getAllDocs>>> | null = null
let searchCache: cacheentry<Awaited<ReturnType<typeof getSearchDocs>>> | null = null
let allInflight: Promise<Awaited<ReturnType<typeof getAllDocs>>> | null = null
let searchInflight: Promise<Awaited<ReturnType<typeof getSearchDocs>>> | null = null
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
		const first = cache.keys().next()
		if (!first.done) cache.delete(first.value)
	}
	cache.set(key, { at: Date.now(), value })
	return value
}

function valid<T>(entry: cacheentry<T> | null): boolean {
	return Boolean(entry && Date.now() - entry.at <= ttl)
}

function doccachehit(query: string): boolean {
	return query ? valid(searchCache) : valid(allCache)
}

async function loadall(): Promise<{ value: Awaited<ReturnType<typeof getAllDocs>>; hit: boolean }> {
	if (valid(allCache) && allCache) return { value: allCache.value, hit: true }
	const pending = allInflight ?? getAllDocs()
	if (!allInflight) allInflight = pending
	const value = await pending.finally(() => {
		if (allInflight === pending) allInflight = null
	})
	allCache = { at: Date.now(), value }
	return { value, hit: false }
}

async function loadsearch(): Promise<{ value: Awaited<ReturnType<typeof getSearchDocs>>; hit: boolean }> {
	if (valid(searchCache) && searchCache) return { value: searchCache.value, hit: true }
	const pending = searchInflight ?? getSearchDocs()
	if (!searchInflight) searchInflight = pending
	const value = await pending.finally(() => {
		if (searchInflight === pending) searchInflight = null
	})
	searchCache = { at: Date.now(), value }
	return { value, hit: false }
}

async function compute(query: string | undefined, limit: number): Promise<computev> {
	if (!query) {
		const docs = await loadall()
		return {
			rows: docs.value.slice(0, limit).map((doc) => ({
				slug: doc.slug,
				title: doc.title,
				description: doc.description,
				snippet: undefined,
				anchor: undefined,
				score: 0,
			})),
			docsHit: docs.hit,
		}
	}
	const docs = await loadsearch()
	const results = await localSearch.search(query, docs.value, limit)
	return {
		rows: results.map((result) => ({
			slug: result.doc.slug,
			title: result.doc.title,
			description: result.doc.description,
			snippet: result.snippet,
			anchor: result.anchor,
			heading: result.heading,
			score: result.score,
		})),
		docsHit: docs.hit,
	}
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
				"X-Search-Docs-Cache": doccachehit(query) ? "hit" : "miss",
				"X-Search-Result-Count": String(cached.length),
			},
		)
	}

	const pending = inflight.get(key) ?? compute(query || undefined, values.limit)
	if (!inflight.has(key)) inflight.set(key, pending)
	const computed = await pending.finally(() => {
		if (inflight.get(key) === pending) inflight.delete(key)
	})
	const duration = performance.now() - started
	return sendjsonwithheaders(
		request,
		set(key, computed.rows),
		cachecontrol,
		{
			"Server-Timing": `search;dur=${duration.toFixed(2)}`,
			"X-Search-Cache": "miss",
			"X-Search-Docs-Cache": computed.docsHit ? "hit" : "miss",
			"X-Search-Result-Count": String(computed.rows.length),
		},
	)
}

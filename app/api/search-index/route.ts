import { addDocument, createIndex, deserializeIndex, serializeIndex, type SearchIndex } from "fromsrc"
import { sendjsonwithheaders } from "@/app/api/_lib/json"
import { getSearchDocs } from "@/app/docs/_lib/content"

interface entry {
	at: number
	value: indexpayload
}

interface indexpayload {
	documents: SearchIndex["documents"]
	terms: [string, number[]][]
	version: number
}

const ttl = 1000 * 60 * 5
const cachecontrol = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
let cached: entry | null = null
let inflight: Promise<indexpayload> | null = null

async function build(): Promise<indexpayload> {
	const docs = await getSearchDocs()
	const index = createIndex()
	for (const doc of docs) {
		addDocument(index, {
			path: doc.slug,
			title: doc.title,
			description: doc.description,
			headings: doc.headings?.map((h) => h.text) ?? [],
			content: doc.content,
		})
	}
	const validated = deserializeIndex(serializeIndex(index))
	return {
		documents: validated.documents,
		terms: [...validated.terms.entries()],
		version: validated.version,
	}
}

async function load(): Promise<indexpayload> {
	if (cached && Date.now() - cached.at < ttl) return cached.value
	const pending = inflight ?? build()
	if (!inflight) inflight = pending
	const value = await pending.finally(() => {
		if (inflight === pending) inflight = null
	})
	cached = { at: Date.now(), value }
	return value
}

export async function GET(request: Request) {
	const started = performance.now()
	const hit = Boolean(cached && Date.now() - cached.at < ttl)
	const value = await load()
	const duration = performance.now() - started
	return sendjsonwithheaders(
		request,
		value,
		cachecontrol,
		{
			"Server-Timing": `index;dur=${duration.toFixed(2)}`,
			"X-Search-Index-Cache": hit ? "hit" : "miss",
			"X-Search-Index-Count": String(value.documents.length),
		},
	)
}

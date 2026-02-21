import type { SearchDoc } from "./content"
import type { SearchAdapter, SearchResult } from "./search"
import { z } from "./schema"

export interface OramaConfig {
	endpoint: string
	readonly key?: string
	index?: string
	headers?: Record<string, string>
}

const hitschema = z.object({
	slug: z.string().optional(),
	path: z.string().optional(),
	title: z.string().optional(),
	description: z.string().optional(),
	content: z.string().optional(),
	anchor: z.string().optional(),
	heading: z.string().optional(),
	snippet: z.string().optional(),
	score: z.number().optional(),
	document: z.object({
		slug: z.string().optional(),
		path: z.string().optional(),
		title: z.string().optional(),
		description: z.string().optional(),
		content: z.string().optional(),
		anchor: z.string().optional(),
		heading: z.string().optional(),
		snippet: z.string().optional(),
		score: z.number().optional(),
	}).optional(),
})

const responseschema = z.union([
	z.object({ hits: z.array(hitschema) }),
	z.object({ results: z.array(hitschema) }),
	z.array(hitschema),
])

function normalize(doc: SearchDoc): SearchDoc {
	return {
		slug: doc.slug,
		title: doc.title,
		description: doc.description,
		content: doc.content ?? "",
		headings: doc.headings,
	}
}

function fallback(query: string, docs: SearchDoc[], limit: number): SearchResult[] {
	if (!query.trim()) return docs.slice(0, limit).map((doc) => ({ doc, score: 0 }))
	return []
}

function extract(payload: z.infer<typeof responseschema>): z.infer<typeof hitschema>[] {
	if (Array.isArray(payload)) return payload
	if ("hits" in payload) return payload.hits
	return payload.results
}

function maphit(hit: z.infer<typeof hitschema>, index: number, total: number): SearchResult | null {
	const source = hit.document ?? hit
	const slug = source.slug ?? source.path
	const title = source.title ?? source.heading ?? slug
	if (!slug || !title) return null
	return {
		doc: normalize({
			slug,
			title,
			description: source.description,
			content: source.content ?? "",
		}),
		score: source.score ?? Math.max(1, total - index),
		snippet: source.snippet ?? source.description ?? source.content,
		anchor: source.anchor,
		heading: source.heading,
	}
}

export function createoramaadapter(config: OramaConfig): SearchAdapter {
	return {
		async search(query: string, docs: SearchDoc[], limit = 8): Promise<SearchResult[]> {
			const value = query.trim()
			if (!value) return fallback(value, docs, limit)
			const response = await fetch(config.endpoint, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					...(config.key ? { authorization: `Bearer ${config.key}` } : {}),
					...(config.headers ?? {}),
				},
				body: JSON.stringify({
					query: value,
					term: value,
					limit,
					index: config.index,
				}),
			})
			if (!response.ok) return []
			const json = await response.json()
			const parsed = responseschema.safeParse(json)
			if (!parsed.success) return []
			const hits = extract(parsed.data)
			const result: SearchResult[] = []
			for (let i = 0; i < hits.length; i++) {
				const item = maphit(hits[i]!, i, hits.length)
				if (item) result.push(item)
			}
			return result
		},
	}
}

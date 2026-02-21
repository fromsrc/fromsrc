import type { SearchDoc } from "./content"
import type { SearchAdapter, SearchResult } from "./search"

export interface OramaConfig {
	endpoint: string
	readonly key?: string
	index?: string
	headers?: Record<string, string>
}

type hit = {
	slug?: string
	path?: string
	title?: string
	description?: string
	content?: string
	anchor?: string
	heading?: string
	snippet?: string
	score?: number
	document?: hit
}

function isrecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null
}

function getstring(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined
}

function getnumber(value: unknown): number | undefined {
	return typeof value === "number" ? value : undefined
}

function parsehit(value: unknown): hit | null {
	if (!isrecord(value)) return null
	const nested = isrecord(value.document) ? parsehit(value.document) : null
	const document = nested ?? undefined
	return {
		slug: getstring(value.slug),
		path: getstring(value.path),
		title: getstring(value.title),
		description: getstring(value.description),
		content: getstring(value.content),
		anchor: getstring(value.anchor),
		heading: getstring(value.heading),
		snippet: getstring(value.snippet),
		score: getnumber(value.score),
		document,
	}
}

function parsehits(value: unknown): hit[] {
	if (Array.isArray(value)) return value.map(parsehit).filter((item): item is hit => item !== null)
	if (!isrecord(value)) return []
	const hits = Array.isArray(value.hits) ? value.hits : Array.isArray(value.results) ? value.results : []
	return hits.map(parsehit).filter((item): item is hit => item !== null)
}

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

function maphit(entry: hit, index: number, total: number): SearchResult | null {
	const source = entry.document ?? entry
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

export function createOramaAdapter(config: OramaConfig): SearchAdapter {
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
			const hits = parsehits(json)
			const result: SearchResult[] = []
			for (let i = 0; i < hits.length; i++) {
				const hit = hits[i]
				if (!hit) continue
				const item = maphit(hit, i, hits.length)
				if (item) result.push(item)
			}
			return result
		},
	}
}

export const createoramaadapter = createOramaAdapter

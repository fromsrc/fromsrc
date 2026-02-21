import type { SearchDoc } from "./content"
import type { SearchAdapter, SearchResult } from "./search"
import { z } from "./schema"

export interface AlgoliaConfig {
	appid: string
	readonly key: string
	index: string
	attributes?: string[]
}

const snippetschema = z.object({
	value: z.string().optional(),
})

const hitschema = z.object({
	slug: z.string().optional(),
	path: z.string().optional(),
	title: z.string().optional(),
	description: z.string().optional(),
	content: z.string().optional(),
	anchor: z.string().optional(),
	heading: z.string().optional(),
	_snippetResult: z.object({
		content: snippetschema.optional(),
		description: snippetschema.optional(),
		heading: snippetschema.optional(),
	}).optional(),
})

const responseschema = z.object({
	hits: z.array(hitschema),
})

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

function maphit(hit: z.infer<typeof hitschema>, index: number, total: number): SearchResult | null {
	const slug = hit.slug ?? hit.path
	const title = hit.title ?? hit.heading ?? slug
	if (!slug || !title) return null
	const snippet =
		hit._snippetResult?.content?.value ??
		hit._snippetResult?.description?.value ??
		hit._snippetResult?.heading?.value ??
		hit.description ??
		hit.content
	return {
		doc: normalize({
			slug,
			title,
			description: hit.description,
			content: hit.content ?? "",
		}),
		score: Math.max(1, total - index),
		snippet,
		anchor: hit.anchor,
		heading: hit.heading,
	}
}

export function createalgoliaadapter(config: AlgoliaConfig): SearchAdapter {
	const body = {
		attributesToRetrieve: config.attributes ?? ["slug", "path", "title", "description", "content", "anchor", "heading"],
		attributesToSnippet: ["content:24", "description:18", "heading:18"],
	}
	return {
		async search(query: string, docs: SearchDoc[], limit = 8): Promise<SearchResult[]> {
			const value = query.trim()
			if (!value) return fallback(value, docs, limit)
			const url = `https://${config.appid}-dsn.algolia.net/1/indexes/${encodeURIComponent(config.index)}/query`
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-algolia-api-key": config.key,
					"x-algolia-application-id": config.appid,
				},
				body: JSON.stringify({ ...body, query: value, hitsPerPage: limit }),
			})
			if (!response.ok) return []
			const json = await response.json()
			const parsed = responseschema.safeParse(json)
			if (!parsed.success) return []
			const result: SearchResult[] = []
			for (let i = 0; i < parsed.data.hits.length; i++) {
				const item = maphit(parsed.data.hits[i]!, i, parsed.data.hits.length)
				if (item) result.push(item)
			}
			return result
		},
	}
}

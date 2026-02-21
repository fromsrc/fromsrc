import type { SearchDoc } from "./content"
import type { SearchAdapter, SearchResult } from "./search"

export interface AlgoliaConfig {
	appid: string
	readonly key: string
	index: string
	attributes?: string[]
}

function isrecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null
}

function getstring(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined
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

function parsehits(value: unknown): Record<string, unknown>[] {
	if (!isrecord(value)) return []
	const hits = value.hits
	if (!Array.isArray(hits)) return []
	return hits.filter(isrecord)
}

function maphit(hit: Record<string, unknown>, index: number, total: number): SearchResult | null {
	const snippetresult = isrecord(hit._snippetResult) ? hit._snippetResult : null
	const contentmeta = snippetresult && isrecord(snippetresult.content) ? snippetresult.content : null
	const descriptionmeta = snippetresult && isrecord(snippetresult.description) ? snippetresult.description : null
	const headingmeta = snippetresult && isrecord(snippetresult.heading) ? snippetresult.heading : null
	const slug = getstring(hit.slug) ?? getstring(hit.path)
	const heading = getstring(hit.heading)
	const title = getstring(hit.title) ?? heading ?? slug
	if (!slug || !title) return null
	const snippet =
		getstring(contentmeta?.value) ??
		getstring(descriptionmeta?.value) ??
		getstring(headingmeta?.value) ??
		getstring(hit.description) ??
		getstring(hit.content)
	return {
		doc: normalize({
			slug,
			title,
			description: getstring(hit.description),
			content: getstring(hit.content) ?? "",
		}),
		score: Math.max(1, total - index),
		snippet,
		anchor: getstring(hit.anchor),
		heading,
	}
}

export function createAlgoliaAdapter(config: AlgoliaConfig): SearchAdapter {
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
			const hits = parsehits(json)
			const result: SearchResult[] = []
			for (let i = 0; i < hits.length; i++) {
				const item = maphit(hits[i]!, i, hits.length)
				if (item) result.push(item)
			}
			return result
		},
	}
}

export const createalgoliaadapter = createAlgoliaAdapter

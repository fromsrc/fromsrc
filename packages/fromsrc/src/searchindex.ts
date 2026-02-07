import type { Heading, SearchDoc } from "./content"

export interface SearchIndexPage {
	slug: string
	title: string
	description?: string
	headings?: Heading[]
	content: string
}

export interface SearchIndex {
	version: 1
	generated: string
	pages: SearchIndexPage[]
}

export interface SearchIndexResult {
	page: SearchIndexPage
	score: number
}

export function generateSearchIndex(docs: SearchDoc[]): SearchIndex {
	return {
		version: 1,
		generated: new Date().toISOString(),
		pages: docs.map((doc) => ({
			slug: doc.slug,
			title: doc.title,
			description: doc.description,
			headings: doc.headings,
			content: doc.content.slice(0, 500),
		})),
	}
}

export function searchFromIndex(index: SearchIndex, query: string): SearchIndexResult[] {
	const q = query.trim().toLowerCase()
	if (!q) return []

	const results: SearchIndexResult[] = []

	for (const page of index.pages) {
		let score = 0
		const title = page.title.toLowerCase()
		const desc = (page.description ?? "").toLowerCase()
		const content = page.content.toLowerCase()

		if (title.includes(q)) score += 10
		if (title.startsWith(q)) score += 5
		if (desc.includes(q)) score += 3
		if (content.includes(q)) score += 1

		if (page.headings) {
			for (const h of page.headings) {
				if (h.text.toLowerCase().includes(q)) score += 4
			}
		}

		if (score > 0) results.push({ page, score })
	}

	return results.sort((a, b) => b.score - a.score)
}

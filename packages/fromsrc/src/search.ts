import type { SearchDoc } from "./content"

export interface SearchResult {
	doc: SearchDoc
	score: number
	snippet?: string
}

export interface SearchAdapter {
	search(query: string, docs: SearchDoc[]): SearchResult[]
	index?(docs: SearchDoc[]): void | Promise<void>
}

function fuzzy(text: string, query: string): number {
	if (!query) return 0
	const lower = text.toLowerCase()
	const q = query.toLowerCase()
	let score = 0
	let qi = 0
	let consecutive = 0

	for (let i = 0; i < lower.length && qi < q.length; i++) {
		if (lower[i] === q[qi]) {
			score += 1 + consecutive
			consecutive++
			qi++
		} else {
			consecutive = 0
		}
	}

	if (qi < q.length) return 0
	if (lower.startsWith(q)) score += 10
	if (lower === q) score += 20

	return score
}

function searchContent(content: string, query: string): { score: number; snippet: string } | null {
	const lower = content.toLowerCase()
	const q = query.toLowerCase()
	const idx = lower.indexOf(q)

	if (idx === -1) return null

	const start = Math.max(0, idx - 40)
	const end = Math.min(content.length, idx + q.length + 60)
	let snippet = content.slice(start, end).trim()

	if (start > 0) snippet = "..." + snippet
	if (end < content.length) snippet = snippet + "..."

	return { score: 5, snippet }
}

export const localSearch: SearchAdapter = {
	search(query: string, docs: SearchDoc[]): SearchResult[] {
		if (!query.trim()) {
			return docs.slice(0, 8).map((doc) => ({ doc, score: 0 }))
		}

		return docs
			.map((doc) => {
				const titleScore = fuzzy(doc.title, query) * 3
				const descScore = doc.description ? fuzzy(doc.description, query) : 0
				const contentResult = doc.content ? searchContent(doc.content, query) : null

				return {
					doc,
					score: titleScore + descScore + (contentResult?.score ?? 0),
					snippet: contentResult?.snippet,
				}
			})
			.filter((r) => r.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, 8)
	},
}

export function createSearchAdapter(adapter: SearchAdapter): SearchAdapter {
	return adapter
}

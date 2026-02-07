import type { SearchDoc } from "./content"

export interface SearchResult {
	doc: SearchDoc
	score: number
	snippet?: string
	anchor?: string
}

export interface SearchAdapter {
	search(query: string, docs: SearchDoc[]): SearchResult[]
	index?(docs: SearchDoc[]): void | Promise<void>
}

interface ContentMatch {
	score: number
	snippet: string
}

interface HeadingMatch {
	score: number
	anchor: string
	snippet: string
}

function fuzzy(text: string | undefined, query: string | undefined): number {
	if (!query || !text) return 0
	if (query.length > text.length) return 0

	const lower = text.toLowerCase()
	const q = query.toLowerCase()

	if (lower === q) return q.length * 2 + 30
	if (lower.startsWith(q)) return q.length * 2 + 10

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

	return qi < q.length ? 0 : score
}

function searchContent(content: string | undefined, query: string): ContentMatch | null {
	if (!content || !query) return null

	const idx = content.toLowerCase().indexOf(query.toLowerCase())
	if (idx === -1) return null

	const start = Math.max(0, idx - 40)
	const end = Math.min(content.length, idx + query.length + 60)
	const prefix = start > 0 ? "..." : ""
	const suffix = end < content.length ? "..." : ""

	return { score: 5, snippet: prefix + content.slice(start, end).trim() + suffix }
}

function searchHeadings(doc: SearchDoc, query: string): HeadingMatch | null {
	if (!doc.headings || !query) return null

	let best: HeadingMatch | null = null

	for (const heading of doc.headings) {
		const score = fuzzy(heading.text, query) * 2
		if (score > 0 && (!best || score > best.score)) {
			best = { score, anchor: heading.id, snippet: heading.text }
		}
	}

	return best
}

export const localSearch: SearchAdapter = {
	search(query: string, docs: SearchDoc[]): SearchResult[] {
		if (!docs || docs.length === 0) return []

		const q = query?.trim() ?? ""
		if (!q) {
			return docs.slice(0, 8).map((doc) => ({ doc, score: 0 }))
		}

		const results: SearchResult[] = []

		for (const doc of docs) {
			const titleScore = fuzzy(doc.title, q) * 3
			const descScore = fuzzy(doc.description, q)
			const headingResult = searchHeadings(doc, q)
			const contentResult = searchContent(doc.content, q)
			const score =
				titleScore + descScore + (headingResult?.score ?? 0) + (contentResult?.score ?? 0)

			if (score > 0) {
				results.push({
					doc,
					score,
					snippet: headingResult?.snippet ?? contentResult?.snippet,
					anchor: headingResult?.anchor,
				})
			}
		}

		results.sort((a, b) => b.score - a.score)
		return results.slice(0, 8)
	},
}

export function createSearchAdapter<T extends SearchAdapter>(adapter: T): T {
	return adapter
}

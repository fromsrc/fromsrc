import type { SearchDoc } from "./content"
import { defaultweights, scoreterms, termindex, type Searchweights, type Termindex } from "./searchscore"

export interface SearchResult {
	doc: SearchDoc
	score: number
	snippet?: string
	anchor?: string
	heading?: string
}

export interface SearchAdapter {
	search(query: string, docs: SearchDoc[], limit?: number): SearchResult[] | Promise<SearchResult[]>
	index?(docs: SearchDoc[]): void | Promise<void>
}

export interface LocalSearchOptions {
	weights?: Partial<Searchweights>
}

interface ContentMatch {
	score: number
	snippet: string
}

interface HeadingMatch {
	score: number
	anchor: string
	heading: string
	snippet: string
}

interface SearchIndexDoc {
	doc: SearchDoc
	title: string
	description: string
	content: string
	contentraw: string
	slug: string
	headings: { id: string; text: string; level: number; normalized: string }[]
	titleindex: Termindex
	descriptionindex: Termindex
	slugindex: Termindex
	headingindex: Termindex
	contentindex: Termindex
}

const indexCache = new WeakMap<SearchDoc[], SearchIndexDoc[]>()

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

function normalize(text: string | undefined): string {
	return text?.toLowerCase().replace(/\s+/g, " ").trim() ?? ""
}

function split(query: string): string[] {
	return normalize(query).split(" ").filter(Boolean)
}

function words(text: string): string[] {
	return text.split(/[^a-z0-9]+/).filter(Boolean)
}

function getIndex(docs: SearchDoc[]): SearchIndexDoc[] {
	const cached = indexCache.get(docs)
	if (cached) return cached
	const indexed = docs.map((doc) => ({
		doc,
		title: normalize(doc.title),
		description: normalize(doc.description),
		content: doc.content.toLowerCase(),
		contentraw: doc.content,
		slug: normalize(doc.slug),
		headings: (doc.headings ?? []).map((heading) => ({
			id: heading.id,
			text: heading.text,
			level: heading.level,
			normalized: normalize(heading.text),
		})),
		titleindex: termindex(words(normalize(doc.title))),
		descriptionindex: termindex(words(normalize(doc.description))),
		slugindex: termindex(words(normalize(doc.slug))),
		headingindex: termindex(words((doc.headings ?? []).map((heading) => normalize(heading.text)).join(" "))),
		contentindex: termindex(words(doc.content.toLowerCase())),
	}))
	indexCache.set(docs, indexed)
	return indexed
}

function searchContent(
	content: string | undefined,
	contentraw: string | undefined,
	query: string,
	terms: string[],
): ContentMatch | null {
	if (!content || !query) return null

	const positions = [content.indexOf(query), ...terms.map((term) => content.indexOf(term))]
	const idx = positions.filter((value) => value >= 0).sort((a, b) => a - b)[0] ?? -1
	if (idx === -1) return null
	const termScore = terms.reduce((score, term) => score + (content.includes(term) ? 1 : 0), 0)

	const start = Math.max(0, idx - 40)
	const source = contentraw ?? content
	const end = Math.min(source.length, idx + query.length + 60)
	const prefix = start > 0 ? "..." : ""
	const suffix = end < source.length ? "..." : ""

	return { score: 5 + termScore, snippet: prefix + source.slice(start, end).trim() + suffix }
}

function searchHeadings(
	headings: { id: string; text: string; level: number; normalized: string }[],
	query: string,
	terms: string[],
): HeadingMatch | null {
	if (headings.length === 0 || !query) return null

	let best: HeadingMatch | null = null

	for (const heading of headings) {
		const termScore = terms.reduce((score, term) => score + (heading.normalized.includes(term) ? 3 : 0), 0)
		const levelBoost = heading.level === 2 ? 8 : heading.level === 3 ? 5 : 3
		const score = fuzzy(heading.normalized, query) * 2 + termScore + levelBoost
		if (score > 0 && (!best || score > best.score)) {
			best = { score, anchor: heading.id, heading: heading.text, snippet: heading.text }
		}
	}

	return best
}

function push(results: SearchResult[], result: SearchResult, limit: number): void {
	if (!Number.isFinite(limit) || results.length < limit) {
		results.push(result)
		return
	}
	let min = 0
	for (let i = 1; i < results.length; i++) {
		const candidate = results[i]
		const current = results[min]
		if (!candidate || !current) continue
		if (candidate.score < current.score) min = i
	}
	const minEntry = results[min]
	if (minEntry && result.score <= minEntry.score) return
	results[min] = result
}

export function createLocalSearch(options: LocalSearchOptions = {}): SearchAdapter {
	const weights: Searchweights = {
		...defaultweights,
		...(options.weights ?? {}),
	}

	return {
	search(query: string, docs: SearchDoc[], limit = Number.POSITIVE_INFINITY): SearchResult[] {
		if (!docs || docs.length === 0) return []

		const q = query?.trim() ?? ""
		if (!q) {
			return docs.slice(0, limit).map((doc) => ({ doc, score: 0 }))
		}

		const terms = split(q)
		const normalized = normalize(q)
		const indexed = getIndex(docs)
		const results: SearchResult[] = []

		for (const item of indexed) {
			const titleScore = fuzzy(item.title, normalized) * 3
			const descScore = fuzzy(item.description, normalized)
			const headingResult = searchHeadings(item.headings, normalized, terms)
			const contentResult = searchContent(item.content, item.contentraw, normalized, terms)
			const termScore = scoreterms(terms, {
				title: item.title,
				slug: item.slug,
				description: item.description,
				content: item.content,
				titleindex: item.titleindex,
				slugindex: item.slugindex,
				descriptionindex: item.descriptionindex,
				headingindex: item.headingindex,
				contentindex: item.contentindex,
			}, weights)
			const exactScore = item.title === normalized || item.slug === normalized ? 30 : 0
			const score =
				titleScore +
				descScore +
				termScore +
				exactScore +
				(headingResult?.score ?? 0) +
				(contentResult?.score ?? 0)

			if (score > 0) {
				push(results, {
					doc: item.doc,
					score,
					snippet: headingResult?.snippet ?? contentResult?.snippet,
					anchor: headingResult?.anchor,
					heading: headingResult?.heading,
				}, limit)
			}
		}

		results.sort((a, b) => b.score - a.score)
		return results
	},
}
}

export const localSearch: SearchAdapter = createLocalSearch()

export function createSearchAdapter<T extends SearchAdapter>(adapter: T): T {
	return adapter
}

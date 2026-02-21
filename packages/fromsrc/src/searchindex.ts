export interface SearchDocument {
	path: string
	title: string
	description?: string
	headings: string[]
	content: string
	tags?: string[]
}

export interface SearchIndex {
	documents: SearchDocument[]
	terms: Map<string, number[]>
	version: number
}

export interface IndexConfig {
	stemming?: boolean
	stopWords?: string[]
	minLength?: number
}

type jsonrecord = Record<string, unknown>

const DEFAULT_STOPS = new Set([
	"the", "a", "an", "is", "are", "was", "were", "in", "on", "at",
	"to", "for", "of", "and", "or", "but", "not", "with", "this", "that",
])

export function tokenize(text: string, config?: IndexConfig): string[] {
	const stops = config?.stopWords ? new Set(config.stopWords) : DEFAULT_STOPS
	const min = config?.minLength ?? 2
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((w) => w.length >= min && !stops.has(w))
}

function indexDocument(index: SearchIndex, idx: number, doc: SearchDocument) {
	const text = [doc.title, doc.description ?? "", ...doc.headings, doc.content].join(" ")
	const tokens = tokenize(text)
	for (const token of tokens) {
		const existing = index.terms.get(token)
		if (existing) {
			if (!existing.includes(idx)) existing.push(idx)
		} else {
			index.terms.set(token, [idx])
		}
	}
}

export function createIndex(config?: IndexConfig): SearchIndex {
	return { documents: [], terms: new Map(), version: 1 }
}

export function addDocument(index: SearchIndex, doc: SearchDocument): void {
	const idx = index.documents.length
	index.documents.push(doc)
	indexDocument(index, idx, doc)
}

export function removeDocument(index: SearchIndex, path: string): void {
	const idx = index.documents.findIndex((d) => d.path === path)
	if (idx === -1) return
	index.documents.splice(idx, 1)
	index.terms.clear()
	for (let i = 0; i < index.documents.length; i++) {
		indexDocument(index, i, index.documents[i]!)
	}
}

export function search(index: SearchIndex, query: string, limit = 10): SearchDocument[] {
	const tokens = tokenize(query)
	if (tokens.length === 0) return []
	const scores = new Map<number, number>()
	for (const token of tokens) {
		const indices = index.terms.get(token)
		if (!indices) continue
		for (const idx of indices) {
			scores.set(idx, (scores.get(idx) ?? 0) + 1)
		}
	}
	return [...scores.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([idx]) => index.documents[idx]!)
}

export function serializeIndex(index: SearchIndex): string {
	return JSON.stringify({
		documents: index.documents,
		terms: [...index.terms.entries()],
		version: index.version,
	})
}

function isrecord(value: unknown): value is jsonrecord {
	return typeof value === "object" && value !== null
}

function issearchdocument(value: unknown): value is SearchDocument {
	if (!isrecord(value)) return false
	if (typeof value.path !== "string") return false
	if (typeof value.title !== "string") return false
	if (typeof value.content !== "string") return false
	if (!Array.isArray(value.headings) || value.headings.some((item) => typeof item !== "string")) return false
	if (value.description !== undefined && typeof value.description !== "string") return false
	if (value.tags !== undefined && (!Array.isArray(value.tags) || value.tags.some((item) => typeof item !== "string"))) {
		return false
	}
	return true
}

function istermentry(value: unknown): value is [string, number[]] {
	if (!Array.isArray(value) || value.length !== 2) return false
	if (typeof value[0] !== "string") return false
	if (!Array.isArray(value[1]) || value[1].some((item) => typeof item !== "number" || !Number.isInteger(item))) {
		return false
	}
	return true
}

export function deserializeIndex(data: string): SearchIndex {
	const parsed: unknown = JSON.parse(data)
	if (!isrecord(parsed)) {
		throw new Error("invalid search index")
	}
	const documents = Array.isArray(parsed.documents) ? parsed.documents : null
	if (!documents || documents.some((item) => !issearchdocument(item))) {
		throw new Error("invalid search index documents")
	}
	const termsraw = Array.isArray(parsed.terms) ? parsed.terms : null
	if (!termsraw || termsraw.some((item) => !istermentry(item))) {
		throw new Error("invalid search index terms")
	}
	const version = parsed.version
	if (typeof version !== "number" || !Number.isInteger(version)) {
		throw new Error("invalid search index version")
	}
	return {
		documents,
		terms: new Map(termsraw),
		version,
	}
}

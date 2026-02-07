export type HighlightResult = { text: string; ranges: { start: number; end: number }[] }
export type SnippetOptions = { maxLength?: number; surroundingWords?: number }

function escape(t: string): string {
	return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function findAll(text: string, query: string): { start: number; end: number }[] {
	const ranges: { start: number; end: number }[] = []
	const lower = text.toLowerCase()
	const q = query.toLowerCase()
	let pos = 0
	while (pos < lower.length) {
		const idx = lower.indexOf(q, pos)
		if (idx === -1) break
		ranges.push({ start: idx, end: idx + q.length })
		pos = idx + 1
	}
	return ranges
}

export function highlightMatches(text: string, query: string): HighlightResult {
	return { text, ranges: query ? findAll(text, query) : [] }
}

export function generateSnippet(text: string, query: string, options?: SnippetOptions): string {
	const maxLength = options?.maxLength ?? 200
	const surrounding = options?.surroundingWords ?? 10
	const idx = text.toLowerCase().indexOf(query.toLowerCase())
	if (idx === -1) return text.slice(0, maxLength) + (text.length > maxLength ? "..." : "")
	const words = text.split(/(\s+)/)
	let charCount = 0
	let matchWord = 0
	for (let i = 0; i < words.length; i++) {
		if (charCount + words[i]!.length > idx) {
			matchWord = i
			break
		}
		charCount += words[i]!.length
	}
	const startWord = Math.max(0, matchWord - surrounding * 2)
	const endWord = Math.min(words.length, matchWord + surrounding * 2 + 1)
	let snippet = words.slice(startWord, endWord).join("")
	if (snippet.length > maxLength) snippet = snippet.slice(0, maxLength)
	const prefix = startWord > 0 ? "..." : ""
	const suffix = endWord < words.length || snippet.length >= maxLength ? "..." : ""
	return prefix + snippet.trim() + suffix
}

export function highlightHtml(text: string, query: string): string {
	if (!query) return escape(text)
	const result: string[] = []
	const lower = text.toLowerCase()
	const q = query.toLowerCase()
	let last = 0
	let pos = 0
	while (pos < lower.length) {
		const idx = lower.indexOf(q, pos)
		if (idx === -1) break
		result.push(escape(text.slice(last, idx)))
		result.push(`<mark>${escape(text.slice(idx, idx + q.length))}</mark>`)
		last = idx + q.length
		pos = idx + 1
	}
	result.push(escape(text.slice(last)))
	return result.join("")
}

export function tokenize(query: string): string[] {
	const terms: string[] = []
	const regex = /"([^"]+)"|(\S+)/g
	let match: RegExpExecArray | null
	while ((match = regex.exec(query)) !== null) {
		terms.push(match[1] ?? match[2]!)
	}
	return terms
}

export function fuzzyHighlight(text: string, terms: string[]): HighlightResult {
	const ranges: { start: number; end: number }[] = []
	for (const term of terms) ranges.push(...findAll(text, term))
	ranges.sort((a, b) => a.start - b.start)
	return { text, ranges }
}

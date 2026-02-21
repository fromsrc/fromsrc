"use client"

import { useEffect, useState } from "react"
import type { SearchResult } from "../search"

interface row {
	slug: string
	title: string
	description?: string
	snippet?: string
	anchor?: string
	score: number
}

const store = new Map<string, SearchResult[]>()

function key(endpoint: string, query: string, limit: number): string {
	return `${endpoint}::${query}::${limit}`
}

function parse(value: unknown): SearchResult[] {
	if (!Array.isArray(value)) return []
	const result: SearchResult[] = []
	for (const item of value) {
		if (!item || typeof item !== "object") continue
		const row = item as row
		if (typeof row.slug !== "string" || typeof row.title !== "string") continue
		if (typeof row.score !== "number") continue
		result.push({
			doc: {
				slug: row.slug,
				title: row.title,
				description: typeof row.description === "string" ? row.description : undefined,
				content: "",
			},
			snippet: typeof row.snippet === "string" ? row.snippet : undefined,
			anchor: typeof row.anchor === "string" ? row.anchor : undefined,
			score: row.score,
		})
	}
	return result
}

export function useSearcher(endpoint: string | undefined, query: string, limit: number) {
	const [results, setResults] = useState<SearchResult[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		const text = query.trim()
		if (!endpoint || !text) {
			setResults([])
			setLoading(false)
			return
		}

		const cachekey = key(endpoint, text, limit)
		const cached = store.get(cachekey)
		if (cached) {
			setResults(cached)
			setLoading(false)
			return
		}

		const controller = new AbortController()
		setLoading(true)
		const params = new URLSearchParams({ q: text, limit: String(limit) })

		fetch(`${endpoint}?${params}`, { signal: controller.signal })
			.then((response) => response.json())
			.then((value) => {
				if (controller.signal.aborted) return
				const parsed = parse(value)
				store.set(cachekey, parsed)
				setResults(parsed)
				setLoading(false)
			})
			.catch(() => {
				if (controller.signal.aborted) return
				setResults([])
				setLoading(false)
			})

		return () => controller.abort()
	}, [endpoint, query, limit])

	return { results, loading }
}


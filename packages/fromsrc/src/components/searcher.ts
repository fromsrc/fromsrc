"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import type { SearchResult } from "../search"

const schema = z.array(
	z.object({
		slug: z.string(),
		title: z.string(),
		description: z.string().optional(),
		snippet: z.string().optional(),
		anchor: z.string().optional(),
		heading: z.string().optional(),
		score: z.number(),
	}),
)

interface cacheentry {
	at: number
	results: SearchResult[]
}

const ttl = 1000 * 60 * 5
const max = 200
const store = new Map<string, cacheentry>()
const inflight = new Map<string, Promise<SearchResult[]>>()

function normalize(query: string): string {
	return query.toLowerCase().replace(/\s+/g, " ").trim()
}

function key(endpoint: string, query: string, limit: number): string {
	return `${endpoint}::${normalize(query)}::${limit}`
}

function convert(rows: z.infer<typeof schema>): SearchResult[] {
	return rows.map((row) => ({
		doc: {
			slug: row.slug,
			title: row.title,
			description: row.description,
			content: "",
		},
		snippet: row.snippet,
		anchor: row.anchor,
		heading: row.heading,
		score: row.score,
	}))
}

function save(key: string, value: SearchResult[]): void {
	if (store.size >= max) {
		const oldest = store.keys().next().value
		if (oldest) store.delete(oldest)
	}
	store.set(key, { at: Date.now(), results: value })
}

async function load(endpoint: string, query: string, limit: number): Promise<SearchResult[]> {
	const params = new URLSearchParams({ q: query, limit: String(limit) })
	const response = await fetch(`${endpoint}?${params}`)
	if (!response.ok) {
		if (response.status === 400) return []
		throw new Error("search request failed")
	}
	const json: unknown = await response.json()
	return convert(schema.parse(json))
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
		if (cached && Date.now() - cached.at < ttl) {
			setResults(cached.results)
			setLoading(false)
			return
		}

		let active = true
		setLoading(true)

		const request = inflight.get(cachekey) ?? load(endpoint, text, limit)
		if (!inflight.has(cachekey)) inflight.set(cachekey, request)

		request
			.then((value) => {
				if (!active) return
				save(cachekey, value)
				setResults(value)
				setLoading(false)
			})
			.catch(() => {
				if (!active) return
				setResults([])
				setLoading(false)
			})
			.finally(() => {
				if (inflight.get(cachekey) === request) inflight.delete(cachekey)
			})

		return () => {
			active = false
		}
	}, [endpoint, query, limit])

	return { results, loading }
}

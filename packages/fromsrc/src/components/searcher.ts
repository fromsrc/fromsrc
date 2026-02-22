"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import type { SearchResult } from "../search"
import { normalizequery, trimquery } from "../searchpolicy"

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
	etag?: string
	results: SearchResult[]
}

const ttl = 1000 * 60 * 5
const max = 200
const store = new Map<string, cacheentry>()
const inflight = new Map<string, Promise<SearchResult[]>>()

function key(endpoint: string, query: string, limit: number): string {
	return `${endpoint}::${normalizequery(query)}::${limit}`
}

function getCache(key: string): cacheentry | null {
	const value = store.get(key)
	if (!value) return null
	if (Date.now() - value.at >= ttl) {
		store.delete(key)
		return null
	}
	store.delete(key)
	store.set(key, value)
	return value
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

function saveWithEtag(key: string, value: SearchResult[], etag?: string): void {
	if (store.has(key)) {
		store.delete(key)
	}
	if (store.size >= max) {
		const oldest = store.keys().next().value
		if (oldest) store.delete(oldest)
	}
	store.set(key, { at: Date.now(), results: value, etag })
}

async function load(
	endpoint: string,
	query: string,
	limit: number,
	stale?: cacheentry,
	signal?: AbortSignal,
): Promise<SearchResult[]> {
	const params = new URLSearchParams({ q: trimquery(query), limit: String(limit) })
	const response = await fetch(`${endpoint}?${params}`, {
		signal,
		headers: stale?.etag ? { "If-None-Match": stale.etag } : undefined,
	})
	if (response.status === 304) return stale?.results ?? []
	if (!response.ok) {
		if (response.status === 400) return []
		throw new Error("search request failed")
	}
	const json: unknown = await response.json()
	const value = convert(schema.parse(json))
	saveWithEtag(key(endpoint, query, limit), value, response.headers.get("etag") ?? undefined)
	return value
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
		const cached = getCache(cachekey)
		if (cached) {
			setResults(cached.results)
			setLoading(false)
			return
		}

		const stale = store.get(cachekey)
		if (stale) {
			setResults(stale.results)
		}

		let active = true
		const controller = new AbortController()
		setLoading(true)

		const request = inflight.get(cachekey) ?? load(endpoint, text, limit, stale, controller.signal)
		if (!inflight.has(cachekey)) inflight.set(cachekey, request)

		request
			.then((value) => {
				if (!active) return
				setResults(value)
				setLoading(false)
			})
			.catch((error: unknown) => {
				if (!active) return
				if (error instanceof DOMException && error.name === "AbortError") return
				setResults([])
				setLoading(false)
			})
			.finally(() => {
				if (inflight.get(cachekey) === request) inflight.delete(cachekey)
			})

		return () => {
			active = false
			controller.abort()
		}
	}, [endpoint, query, limit])

	return { results, loading }
}

import type { DocMeta, Heading, SearchDoc } from "./content"
import { z } from "./schema"

export interface ContentSource {
	list(): Promise<DocMeta[]>
	get(slug: string[]): Promise<{ content: string; data: Record<string, unknown> } | null>
	search?(): Promise<SearchDoc[]>
}

export interface RemoteSourceConfig {
	baseUrl: string
	index?: string
	docsEndpoint?: string
	rawEndpoint?: string
	searchIndexEndpoint?: string
	ttl?: number
}

export function createRemoteSource(config: RemoteSourceConfig): ContentSource {
	const base = trimslash(config.baseUrl)
	const ttl = config.ttl ?? 1000 * 60 * 5
	const indexUrl = config.index || `${base}/llms.txt`
	const docsUrl = config.docsEndpoint || `${base}/api/docs?limit=1000`
	const rawUrl = trimslash(config.rawEndpoint || `${base}/api/raw`)
	const searchIndexUrl = config.searchIndexEndpoint || `${base}/api/search-index`
	const listcache = createcache<DocMeta[]>(ttl)
	const filecache = createcache<{ content: string; data: Record<string, unknown> }>(ttl)
	const searchcache = createcache<SearchDoc[]>(ttl)

	return {
		async list() {
			const cached = listcache.get("list")
			if (cached) return cached
			const docs = await loaddocs(docsUrl)
			if (docs.length > 0) {
				listcache.set("list", docs)
				return docs
			}
			const llms = await loadllms(indexUrl, base)
			listcache.set("list", llms)
			return llms
		},

		async get(slug) {
			const path = slug.length === 0 ? "index" : slug.join("/")
			const cached = filecache.get(path)
			if (cached) return cached
			const normalized = slug.length === 0 ? "index" : slug.map((part) => encodeURIComponent(part)).join("/")
			const res = await fetch(`${rawUrl}/${normalized}`)
			if (!res.ok) return null
			const content = await res.text()
			const value = { content, data: {} }
			filecache.set(path, value)
			return value
		},

		async search() {
			const cached = searchcache.get("search")
			if (cached) return cached
			const docs = await loadsearch(searchIndexUrl)
			searchcache.set("search", docs)
			return docs
		},
	}
}

interface cacheentry<T> {
	data: T
	at: number
}

function createcache<T>(ttl: number) {
	const store = new Map<string, cacheentry<T>>()
	return {
		get(key: string): T | null {
			const value = store.get(key)
			if (!value) return null
			if (Date.now() - value.at > ttl) {
				store.delete(key)
				return null
			}
			return value.data
		},
		set(key: string, data: T): void {
			store.set(key, { data, at: Date.now() })
		},
	}
}

const docsSchema = z.object({
	data: z.array(
		z.object({
			slug: z.string(),
			title: z.string(),
			description: z.string().optional(),
		}),
	),
})

const indexSchema = z.object({
	documents: z.array(
		z.object({
			path: z.string(),
			title: z.string(),
			description: z.string().optional(),
			headings: z.array(z.string()),
			content: z.string(),
		}),
	),
})

async function loaddocs(url: string): Promise<DocMeta[]> {
	try {
		const res = await fetch(url)
		if (!res.ok) return []
		const data = docsSchema.parse(await res.json())
		return data.data
	} catch {
		return []
	}
}

async function loadsearch(url: string): Promise<SearchDoc[]> {
	try {
		const res = await fetch(url)
		if (!res.ok) return []
		const data = indexSchema.parse(await res.json())
		return data.documents.map((doc) => ({
			slug: normalizepath(doc.path),
			title: doc.title,
			description: doc.description,
			content: doc.content,
			headings: headings(doc.headings),
		}))
	} catch {
		return []
	}
}

async function loadllms(url: string, base: string): Promise<DocMeta[]> {
	try {
		const res = await fetch(url)
		if (!res.ok) return []
		const text = await res.text()
		return parseLlmsIndex(text, base)
	} catch {
		return []
	}
}

function parseLlmsIndex(text: string, baseUrl: string): DocMeta[] {
	const docs: DocMeta[] = []

	for (const line of text.split("\n")) {
		const match = line.match(/^- \[(.+?)\]\((.+?)\)(?:: (.+))?$/)
		if (!match) continue

		const title = match[1]
		const url = match[2]
		if (!title || !url) continue
		const description = match[3]?.trim()
		const slug = slugfrom(url, baseUrl)
		if (!slug && url !== `${baseUrl}/docs`) continue

		docs.push({ slug, title, description })
	}

	return docs
}

function slugfrom(value: string, base: string): string {
	const parsed = parseurl(value, base)
	if (!parsed) return ""
	const path = parsed.pathname
		.replace(/^\/docs\/?/, "")
		.replace(/\/$/, "")
		.trim()
	return normalizepath(path)
}

function parseurl(value: string, base: string): URL | null {
	try {
		return new URL(value, base)
	} catch {
		return null
	}
}

function normalizepath(value: string): string {
	return value.replace(/^\/+/, "").replace(/\/+$/, "")
}

function trimslash(value: string): string {
	return value.replace(/\/+$/, "")
}

function headingid(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9_-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

function headings(values: string[]): Heading[] | undefined {
	if (values.length === 0) return undefined
	const seen = new Map<string, number>()
	const list: Heading[] = []
	for (const text of values) {
		const base = headingid(text)
		if (!base) continue
		const count = seen.get(base) ?? 0
		seen.set(base, count + 1)
		const id = count === 0 ? base : `${base}-${count}`
		list.push({ id, text, level: 2 })
	}
	return list.length > 0 ? list : undefined
}

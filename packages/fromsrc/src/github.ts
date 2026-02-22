import matter from "gray-matter"
import { extractHeadings, type DocMeta, type SearchDoc } from "./content"
import type { ContentSource } from "./source"

export interface GithubSourceConfig {
	owner: string
	repo: string
	branch?: string
	path?: string
	token?: string
}

interface TreeEntry {
	path: string
	type: "blob" | "tree"
	sha: string
}

interface CacheEntry<T> {
	data: T
	timestamp: number
}

interface TreeCacheEntry {
	entries: TreeEntry[]
	truncated: boolean
	etag?: string
}

const TTL = 5 * 60 * 1000

function createCache<T>() {
	const store = new Map<string, CacheEntry<T>>()

	return {
		get(key: string): T | null {
			const entry = store.get(key)
			if (!entry) return null
			if (Date.now() - entry.timestamp > TTL) {
				store.delete(key)
				return null
			}
			return entry.data
		},
		set(key: string, data: T) {
			store.set(key, { data, timestamp: Date.now() })
		},
	}
}

export function createGithubSource(config: GithubSourceConfig): ContentSource {
	const branch = config.branch ?? "main"
	const docsPath = config.path ?? "docs"
	const headers: Record<string, string> = {
		Accept: "application/vnd.github+json",
		"X-GitHub-Api-Version": "2022-11-28",
	}
	if (config.token) {
		headers.Authorization = `Bearer ${config.token}`
	}

	const listCache = createCache<DocMeta[]>()
	const fileCache = createCache<{ content: string; data: Record<string, unknown> }>()
	const searchCache = createCache<SearchDoc[]>()
	const treeCache = createCache<TreeCacheEntry>()

	function rawUrl(filepath: string): string {
		return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/${filepath}`
	}

	function treeUrl(ref: string, recursive: boolean): string {
		const suffix = recursive ? "?recursive=1" : ""
		return `https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${ref}${suffix}`
	}

	function joinPath(base: string, path: string): string {
		if (!base) return path
		return `${base}/${path}`
	}

	async function tree(ref: string, recursive: boolean): Promise<{ entries: TreeEntry[]; truncated: boolean }> {
		const url = treeUrl(ref, recursive)
		const cached = treeCache.get(url)
		const requestHeaders = { ...headers }
		if (cached?.etag) {
			requestHeaders["If-None-Match"] = cached.etag
		}
		const res = await fetch(url, { headers: requestHeaders })
		if (res.status === 304 && cached) {
			return { entries: cached.entries, truncated: cached.truncated }
		}
		if (!res.ok) {
			console.error(`github tree request failed (${res.status}) for ${url}`)
			return cached ? { entries: cached.entries, truncated: cached.truncated } : { entries: [], truncated: false }
		}
		const json = (await res.json()) as {
			tree?: Array<{ path?: string; type?: string; sha?: string }>
			truncated?: boolean
		}
		const entries = (json.tree ?? [])
			.filter((item): item is { path: string; type: "blob" | "tree"; sha: string } =>
				typeof item.path === "string" &&
				(item.type === "blob" || item.type === "tree") &&
				typeof item.sha === "string",
			)
			.map((item) => ({
				path: item.path,
				type: item.type,
				sha: item.sha,
			}))
		const result = {
			entries,
			truncated: json.truncated === true,
		}
		treeCache.set(url, {
			entries: result.entries,
			truncated: result.truncated,
			etag: res.headers.get("etag") ?? undefined,
		})
		return result
	}

	async function allEntries(): Promise<TreeEntry[]> {
		const recursive = await tree(branch, true)
		if (!recursive.truncated) return recursive.entries
		const root = await tree(branch, false)
		const files = root.entries.filter((item) => item.type === "blob")
		const dirs = root.entries.filter((item) => item.type === "tree")
		while (dirs.length > 0) {
			const current = dirs.shift()
			if (!current) continue
			const next = await tree(current.sha, false)
			for (const item of next.entries) {
				const path = joinPath(current.path, item.path)
				if (item.type === "blob") {
					files.push({ ...item, path })
				} else {
					dirs.push({ ...item, path })
				}
			}
		}
		return files
	}

	const list = async (): Promise<DocMeta[]> => {
		const cached = listCache.get("list")
		if (cached) return cached

		try {
			const entries = await allEntries()
			const prefix = docsPath ? `${docsPath}/` : ""
			const docs: DocMeta[] = entries
				.filter((item) => item.path.startsWith(prefix) && item.path.endsWith(".mdx"))
				.map((item) => {
					const slug = item.path
						.slice(prefix.length)
						.replace(/\.mdx$/, "")
						.replace(/\/index$/, "")
					return { slug, title: slug.split("/").pop() ?? slug }
				})

			listCache.set("list", docs)
			return docs
		} catch (error) {
			console.error("github source list failed", error)
			return []
		}
	}

	const get = async (slug: string[]): Promise<{ content: string; data: Record<string, unknown> } | null> => {
		const path = slug.length === 0 ? "index" : slug.join("/")
		const cacheKey = path

		const cached = fileCache.get(cacheKey)
		if (cached) return cached

		const filepath = `${docsPath}/${path}.mdx`
		const indexPath = `${docsPath}/${path}/index.mdx`

		for (const candidate of [filepath, indexPath]) {
			try {
				const res = await fetch(rawUrl(candidate), { headers })
				if (!res.ok) continue
				const raw = await res.text()
				const { content, data } = matter(raw)
				const result = { content, data }
				fileCache.set(cacheKey, result)
				return result
			} catch (error) {
				console.error(`github source fetch failed for ${candidate}`, error)
				continue
			}
		}

		return null
	}

	return {
		list,
		get,
		async search() {
			const cached = searchCache.get("search")
			if (cached) return cached
			const listed = await list()
			const docs: SearchDoc[] = []
			const batchSize = 8
			for (let index = 0; index < listed.length; index += batchSize) {
				const batch = listed.slice(index, index + batchSize)
				const values = await Promise.all(
					batch.map(async (doc) => {
						const value = await get(doc.slug ? doc.slug.split("/") : [])
						if (!value) return null
						const title = typeof value.data.title === "string" && value.data.title.length > 0
							? value.data.title
							: doc.title
						const description = typeof value.data.description === "string"
							? value.data.description
							: doc.description
						return {
							slug: doc.slug,
							title,
							description,
							content: value.content,
							headings: extractHeadings(value.content),
						} satisfies SearchDoc
					}),
				)
				for (const item of values) {
					if (!item) continue
					docs.push(item)
				}
			}
			searchCache.set("search", docs)
			return docs
		},
	}
}

import matter from "gray-matter"
import type { DocMeta, SearchDoc } from "./content"
import type { ContentSource } from "./source"

export interface GithubSourceConfig {
	owner: string
	repo: string
	branch?: string
	path?: string
	token?: string
}

interface CacheEntry<T> {
	data: T
	timestamp: number
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
	const headers: Record<string, string> = {}
	if (config.token) {
		headers.Authorization = `Bearer ${config.token}`
	}

	const listCache = createCache<DocMeta[]>()
	const fileCache = createCache<{ content: string; data: Record<string, unknown> }>()

	function rawUrl(filepath: string): string {
		return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${branch}/${filepath}`
	}

	function treeUrl(): string {
		return `https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${branch}?recursive=1`
	}

	return {
		async list() {
			const cached = listCache.get("list")
			if (cached) return cached

			try {
				const res = await fetch(treeUrl(), {
					headers: { ...headers, Accept: "application/vnd.github.v3+json" },
				})
				if (!res.ok) return []

				const json = (await res.json()) as {
					tree: { path: string; type: string }[]
				}

				const prefix = docsPath ? `${docsPath}/` : ""
				const docs: DocMeta[] = json.tree
					.filter((item) => item.type === "blob" && item.path.startsWith(prefix) && item.path.endsWith(".mdx"))
					.map((item) => {
						const slug = item.path
							.slice(prefix.length)
							.replace(/\.mdx$/, "")
							.replace(/\/index$/, "")
						return { slug, title: slug.split("/").pop() ?? slug }
					})

				listCache.set("list", docs)
				return docs
			} catch {
				return []
			}
		},

		async get(slug) {
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
				} catch {
					continue
				}
			}

			return null
		},
	}
}

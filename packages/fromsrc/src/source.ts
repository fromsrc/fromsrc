import type { DocMeta, SearchDoc } from "./content"

export interface ContentSource {
	list(): Promise<DocMeta[]>
	get(slug: string[]): Promise<{ content: string; data: Record<string, unknown> } | null>
	search?(): Promise<SearchDoc[]>
}

export interface RemoteSourceConfig {
	baseUrl: string
	index?: string
}

export function createRemoteSource(config: RemoteSourceConfig): ContentSource {
	const indexUrl = config.index || `${config.baseUrl}/llms.txt`

	return {
		async list() {
			const res = await fetch(indexUrl)
			if (!res.ok) return []
			const text = await res.text()
			return parseLlmsIndex(text, config.baseUrl)
		},

		async get(slug) {
			const path = slug.length === 0 ? "index" : slug.join("/")
			const res = await fetch(`${config.baseUrl}/api/raw/${path}`)
			if (!res.ok) return null
			const content = await res.text()
			return { content, data: {} }
		},
	}
}

function parseLlmsIndex(text: string, baseUrl: string): DocMeta[] {
	const docs: DocMeta[] = []

	for (const line of text.split("\n")) {
		const match = line.match(/^- \[(.+?)\]\((.+?)\)(?:: (.+))?$/)
		if (!match) continue

		const title = match[1]!
		const url = match[2]!
		const description = match[3]?.trim()
		const slug = url.replace(`${baseUrl}/docs/`, "").replace("/docs/", "").replace("/docs", "")

		docs.push({ slug, title, description })
	}

	return docs
}

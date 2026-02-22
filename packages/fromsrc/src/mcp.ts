import type { DocMeta, SearchDoc } from "./content"
import { localSearch } from "./search"
import { trimquery } from "./searchpolicy"
import type { ContentSource } from "./source"

export interface McpConfig {
	name: string
	version: string
	baseUrl: string
}

interface McpTool {
	name: string
	description: string
	inputSchema: {
		type: "object"
		properties?: Record<string, { type: string; description: string }>
		required?: string[]
	}
}

interface McpManifest {
	server: { name: string; version: string }
	capabilities: {
		tools: {
			listChanged: boolean
		}
	}
	tools: McpTool[]
}

export function generateMcpManifest(config: McpConfig): McpManifest {
	return {
		server: { name: config.name, version: config.version },
		capabilities: {
			tools: {
				listChanged: false,
			},
		},
		tools: [
			{
				name: "search_docs",
				description: "Search documentation",
				inputSchema: {
					type: "object",
					properties: {
						query: { type: "string", description: "Search query" },
					},
					required: ["query"],
				},
			},
			{
				name: "get_page",
				description: "Get a specific documentation page",
				inputSchema: {
					type: "object",
					properties: {
						slug: { type: "string", description: "Page slug" },
					},
					required: ["slug"],
				},
			},
			{
				name: "list_pages",
				description: "List all available documentation pages",
				inputSchema: { type: "object" },
			},
		],
	}
}

interface PageEntry {
	slug: string
	title: string
	description?: string
}

interface SearchEntry {
	slug: string
	title: string
	snippet?: string
}

interface McpHandler {
	search(query: string): Promise<SearchEntry[]>
	getPage(slug: string): Promise<string | null>
	listPages(): Promise<PageEntry[]>
}

export function createMcpHandler(config: McpConfig, source: ContentSource): McpHandler {
	return {
		async search(query) {
			if (!source.search) return []
			const docs = await source.search()
			const results = await Promise.resolve(localSearch.search(trimquery(query), docs, 10))
			return results.map((item) => ({
				slug: item.doc.slug,
				title: item.doc.title,
				snippet: item.snippet ?? item.doc.description ?? item.doc.content.slice(0, 120),
			}))
		},

		async getPage(slug) {
			const result = await source.get(slug.split("/"))
			if (!result) return null
			return result.content
		},

		async listPages() {
			const docs = await source.list()
			return docs.map((d) => ({
				slug: d.slug,
				title: d.title,
				description: d.description,
			}))
		},
	}
}

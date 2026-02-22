import { generateMcpManifest, z } from "fromsrc"
import { init, list, page, protocol, resource, search, supported, toolcall } from "./rpc"

interface config {
	name: string
	version: string
	baseUrl: string
}

interface pageitem {
	slug: string
	title: string
	description?: string
}

interface handler {
	search(query: string): Promise<{ slug: string; title: string; snippet?: string }[]>
	getPage(slug: string): Promise<string | null>
	listPages(): Promise<pageitem[]>
}

interface core {
	name: z.infer<typeof import("./rpc").methodname>
	params: unknown
	config: config
	handler: handler
}

interface ok {
	ok: true
	result: unknown
	status?: number
}

interface fail {
	ok: false
	code: number
	message: string
	status: number
}

function paged<T extends { slug: string }>(items: T[], input: NonNullable<z.infer<typeof list>>): { items: T[]; nextCursor?: string } {
	const limit = input.limit ?? 50
	if (!input.cursor) {
		const slice = items.slice(0, limit)
		const next = items[limit]?.slug
		return next ? { items: slice, nextCursor: next } : { items: slice }
	}
	const start = items.findIndex((item) => item.slug === input.cursor)
	if (start < 0) return { items: items.slice(0, limit), nextCursor: items[limit]?.slug }
	const from = start + 1
	const slice = items.slice(from, from + limit)
	const next = items[from + limit]?.slug
	return next ? { items: slice, nextCursor: next } : { items: slice }
}

function uri(slug: string): string {
	const safe = slug.length > 0 ? slug : "index"
	return `fromsrc://docs/${safe}`
}

function slug(uri: string): string | null {
	const prefix = "fromsrc://docs/"
	if (!uri.startsWith(prefix)) return null
	const value = uri.slice(prefix.length).replace(/\/+$/, "")
	if (value.length === 0 || value === "index") return ""
	return value
}

function toolresult(
	text: string,
	structured?: Record<string, unknown>,
): { content: { type: "text"; text: string }[]; structuredContent?: Record<string, unknown>; isError: boolean } {
	return {
		content: [{ type: "text", text }],
		structuredContent: structured,
		isError: false,
	}
}

export async function execute(core: core): Promise<ok | fail> {
	switch (core.name) {
		case "initialize": {
			const parsed = init.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const selected = supported.has(parsed.data.protocolVersion) ? parsed.data.protocolVersion : protocol
			return {
				ok: true,
				result: {
					protocolVersion: selected,
					capabilities: { tools: { listChanged: false }, resources: { listChanged: false } },
					serverInfo: { name: core.config.name, version: core.config.version },
				},
			}
		}
		case "notifications/initialized":
			return { ok: true, result: { ok: true }, status: 202 }
		case "ping":
			return { ok: true, result: {} }
		case "search_docs": {
			const parsed = search.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			return { ok: true, result: await core.handler.search(parsed.data.query) }
		}
		case "get_page": {
			const parsed = page.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const content = await core.handler.getPage(parsed.data.slug)
			if (!content) return { ok: false, code: -32004, message: "not found", status: 404 }
			return { ok: true, result: { content } }
		}
		case "list_pages": {
			const parsed = list.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const pages = await core.handler.listPages()
			if (!parsed.data) return { ok: true, result: pages }
			return { ok: true, result: paged(pages, parsed.data) }
		}
		case "tools/list": {
			const parsed = list.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const tools = generateMcpManifest(core.config).tools
			if (!parsed.data) return { ok: true, result: { tools } }
			const result = paged(tools.map((item) => ({ ...item, slug: item.name })), parsed.data)
			return { ok: true, result: { tools: result.items.map(({ slug: _slug, ...tool }) => tool), nextCursor: result.nextCursor } }
		}
		case "tools/call": {
			const parsed = toolcall.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const args = parsed.data.arguments ?? {}
			if (parsed.data.name === "search_docs") {
				const query = search.safeParse(args)
				if (!query.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
				const results = await core.handler.search(query.data.query)
				return { ok: true, result: toolresult(JSON.stringify(results), { results }) }
			}
			if (parsed.data.name === "get_page") {
				const target = page.safeParse(args)
				if (!target.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
				const content = await core.handler.getPage(target.data.slug)
				if (!content) return { ok: false, code: -32004, message: "not found", status: 404 }
				return { ok: true, result: toolresult(content, { content }) }
			}
			if (parsed.data.name === "list_pages") {
				const listed = list.safeParse(args)
				if (!listed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
				const pages = await core.handler.listPages()
				if (!listed.data) return { ok: true, result: toolresult(JSON.stringify(pages), { pages }) }
				const result = paged(pages, listed.data)
				return { ok: true, result: toolresult(JSON.stringify(result), result) }
			}
			return { ok: false, code: -32601, message: "unknown tool", status: 400 }
		}
		case "resources/list": {
			const parsed = list.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const pages = await core.handler.listPages()
			const resources = pages.map((item) => ({ slug: item.slug, uri: uri(item.slug), name: item.title, description: item.description, mimeType: "text/markdown" }))
			if (!parsed.data) return { ok: true, result: { resources: resources.map(({ slug: _slug, ...item }) => item) } }
			const result = paged(resources, parsed.data)
			return { ok: true, result: { resources: result.items.map(({ slug: _slug, ...item }) => item), nextCursor: result.nextCursor } }
		}
		case "resources/templates/list":
			return { ok: true, result: { resourceTemplates: [{ uriTemplate: "fromsrc://docs/{slug}", name: "docs", description: "Docs markdown pages", mimeType: "text/markdown" }] } }
		case "resources/read": {
			const parsed = resource.safeParse(core.params)
			if (!parsed.success) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const value = slug(parsed.data.uri)
			if (value === null) return { ok: false, code: -32602, message: "invalid params", status: 400 }
			const content = await core.handler.getPage(value)
			if (!content) return { ok: false, code: -32004, message: "not found", status: 404 }
			return { ok: true, result: { contents: [{ uri: parsed.data.uri, mimeType: "text/markdown", text: content }] } }
		}
		default:
			return { ok: false, code: -32601, message: "unknown method", status: 400 }
	}
}

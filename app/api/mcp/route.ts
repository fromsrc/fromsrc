import { type ContentSource, createMcpHandler, generateMcpManifest, z } from "fromsrc"
import { siteurl } from "@/app/_lib/site"
import { sendjson } from "@/app/api/_lib/json"
import { init, method, page, protocol, rpcmethod, search, supported, toolcall, toollist } from "./rpc"
import { getAllDocs, getDoc, getSearchDocs } from "@/app/docs/_lib/content"

const config = {
	name: "fromsrc",
	version: "1.0.0",
	baseUrl: siteurl(),
}
const source: ContentSource = {
	async list() {
		return getAllDocs()
	},
	async get(slug) {
		const doc = await getDoc(slug)
		if (!doc) return null
		return { content: doc.content, data: doc.data }
	},
	async search() {
		return getSearchDocs()
	},
}

const handler = createMcpHandler(config, source)
const cors = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
}
const cachecontrol = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: cors })
}

export async function GET(request: Request) {
	const manifest = generateMcpManifest(config)
	const response = sendjson(request, manifest, cachecontrol)
	for (const [key, value] of Object.entries(cors)) response.headers.set(key, value)
	return response
}

export async function POST(request: Request) {
	let body: unknown
	try {
		body = await request.json()
	} catch {
		return Response.json({ error: "invalid json" }, { status: 400, headers: cors })
	}
	const rpc = rpcmethod.safeParse(body)
	let name: z.infer<typeof method>["method"]
	let params: unknown
	if (rpc.success) {
		name = rpc.data.method
		params = rpc.data.params
	} else {
		const legacy = method.safeParse(body)
		if (!legacy.success) {
			return Response.json({ error: "invalid method" }, { status: 400, headers: cors })
		}
		name = legacy.data.method
		params = (body as { params?: unknown }).params
	}
	const rid = rpc.success ? rpc.data.id : undefined

	function jsonrpc(result: unknown, status = 200): Response {
		if (!rpc.success) return Response.json(result, { status, headers: cors })
		if (rid === undefined) return new Response(null, { status: 202, headers: cors })
		return Response.json({ jsonrpc: "2.0", id: rid, result }, { status, headers: cors })
	}

	function jsonerror(code: number, message: string, status = 400): Response {
		if (!rpc.success) return Response.json({ error: message }, { status, headers: cors })
		return Response.json({ jsonrpc: "2.0", id: rid ?? null, error: { code, message } }, { status, headers: cors })
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

	switch (name) {
		case "initialize": {
			const request = init.safeParse(params)
			if (!request.success) return jsonerror(-32602, "invalid params")
			const value = request.data.protocolVersion
			const selected = supported.has(value) ? value : protocol
			return jsonrpc({
				protocolVersion: selected,
				capabilities: {
					tools: { listChanged: false },
				},
				serverInfo: {
					name: config.name,
					version: config.version,
				},
			})
		}
		case "notifications/initialized":
			return jsonrpc({ ok: true }, 202)
		case "ping":
			return jsonrpc({})
		case "search_docs": {
			const query = search.safeParse(params)
			if (!query.success) return jsonerror(-32602, "invalid params")
			const results = await handler.search(query.data.query)
			return jsonrpc(results)
		}
		case "get_page": {
			const slug = page.safeParse(params)
			if (!slug.success) return jsonerror(-32602, "invalid params")
			const content = await handler.getPage(slug.data.slug)
			if (!content) return jsonerror(-32004, "not found", 404)
			return jsonrpc({ content })
		}
		case "list_pages": {
			const pages = await handler.listPages()
			return jsonrpc(pages)
		}
		case "tools/list": {
			const listed = toollist.safeParse(params)
			if (!listed.success) return jsonerror(-32602, "invalid params")
			const manifest = generateMcpManifest(config)
			return jsonrpc({ tools: manifest.tools })
		}
		case "tools/call": {
			const call = toolcall.safeParse(params)
			if (!call.success) return jsonerror(-32602, "invalid params")
			const args = call.data.arguments ?? {}
			switch (call.data.name) {
				case "search_docs": {
					const query = search.safeParse(args)
					if (!query.success) return jsonerror(-32602, "invalid params")
					const results = await handler.search(query.data.query)
					return jsonrpc(toolresult(JSON.stringify(results), { results }))
				}
				case "get_page": {
					const slug = page.safeParse(args)
					if (!slug.success) return jsonerror(-32602, "invalid params")
					const content = await handler.getPage(slug.data.slug)
					if (!content) return jsonerror(-32004, "not found", 404)
					return jsonrpc(toolresult(content, { content }))
				}
				case "list_pages": {
					const pages = await handler.listPages()
					return jsonrpc(toolresult(JSON.stringify(pages), { pages }))
				}
				default:
					return jsonerror(-32601, "unknown tool")
			}
		}
		default:
			return jsonerror(-32601, "unknown method")
	}
}

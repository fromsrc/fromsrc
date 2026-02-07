import { type ContentSource, createMcpHandler, generateMcpManifest } from "fromsrc"
import { getAllDocs, getDoc, getSearchDocs } from "@/app/docs/_lib/content"

const config = {
	name: "fromsrc",
	version: "1.0.0",
	baseUrl: "https://fromsrc.com",
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

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: cors })
}

export async function GET() {
	const manifest = generateMcpManifest(config)
	return Response.json(manifest, { headers: cors })
}

export async function POST(request: Request) {
	const body = await request.json()
	const { method, params } = body

	switch (method) {
		case "search_docs": {
			const results = await handler.search(params.query)
			return Response.json(results, { headers: cors })
		}
		case "get_page": {
			const page = await handler.getPage(params.slug)
			if (!page) return Response.json({ error: "not found" }, { status: 404, headers: cors })
			return Response.json({ content: page }, { headers: cors })
		}
		case "list_pages": {
			const pages = await handler.listPages()
			return Response.json(pages, { headers: cors })
		}
		default:
			return Response.json({ error: "unknown method" }, { status: 400, headers: cors })
	}
}

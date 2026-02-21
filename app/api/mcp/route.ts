import { type ContentSource, createMcpHandler, generateMcpManifest, z } from "fromsrc"
import { siteurl } from "@/app/_lib/site"
import { sendjson } from "@/app/api/_lib/json"
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
const method = z.object({ method: z.enum(["search_docs", "get_page", "list_pages"]) })
const search = z.object({ query: z.string().trim().min(1).max(200) })
const page = z.object({ slug: z.string().trim().min(1).max(300) })

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
	const parsed = method.safeParse(body)
	if (!parsed.success) {
		return Response.json({ error: "invalid method" }, { status: 400, headers: cors })
	}
	const params = (body as { params?: unknown }).params

	switch (parsed.data.method) {
		case "search_docs": {
			const query = search.safeParse(params)
			if (!query.success) {
				return Response.json({ error: "invalid params" }, { status: 400, headers: cors })
			}
			const results = await handler.search(query.data.query)
			return Response.json(results, { headers: cors })
		}
		case "get_page": {
			const slug = page.safeParse(params)
			if (!slug.success) {
				return Response.json({ error: "invalid params" }, { status: 400, headers: cors })
			}
			const content = await handler.getPage(slug.data.slug)
			if (!content) return Response.json({ error: "not found" }, { status: 404, headers: cors })
			return Response.json({ content }, { headers: cors })
		}
		case "list_pages": {
			const pages = await handler.listPages()
			return Response.json(pages, { headers: cors })
		}
		default:
			return Response.json({ error: "unknown method" }, { status: 400, headers: cors })
	}
}

import { type ContentSource, createMcpHandler, generateMcpManifest, z } from "fromsrc"
import { siteurl } from "@/app/_lib/site"
import { sendjson } from "@/app/api/_lib/json"
import { execute } from "./ops"
import { method, rpcmethod } from "./rpc"
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

function sendrpc(rpc: z.SafeParseReturnType<unknown, z.infer<typeof rpcmethod>>, id: z.infer<typeof rpcmethod>["id"], result: unknown, status = 200): Response {
	if (!rpc.success) return Response.json(result, { status, headers: cors })
	if (id === undefined) return new Response(null, { status: 202, headers: cors })
	return Response.json({ jsonrpc: "2.0", id, result }, { status, headers: cors })
}

function senderror(rpc: z.SafeParseReturnType<unknown, z.infer<typeof rpcmethod>>, id: z.infer<typeof rpcmethod>["id"], code: number, message: string, status = 400): Response {
	if (!rpc.success) return Response.json({ error: message }, { status, headers: cors })
	return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status, headers: cors })
}

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
	const id = rpc.success ? rpc.data.id : undefined
	let name: z.infer<typeof method>["method"]
	let params: unknown

	if (rpc.success) {
		name = rpc.data.method
		params = rpc.data.params
	} else {
		const legacy = method.safeParse(body)
		if (!legacy.success) return Response.json({ error: "invalid method" }, { status: 400, headers: cors })
		name = legacy.data.method
		params = (body as { params?: unknown }).params
	}

	const result = await execute({ name, params, config, handler })
	if (!result.ok) return senderror(rpc, id, result.code, result.message, result.status)
	return sendrpc(rpc, id, result.result, result.status ?? 200)
}

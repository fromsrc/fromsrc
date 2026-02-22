import { z } from "fromsrc"
import { searchmaxquery } from "fromsrc/searchpolicy"

export const protocol = "2025-06-18"
export const supported = new Set(["2025-06-18", "2025-03-26", "2024-11-05"])

export const methodname = z.enum([
	"search_docs",
	"get_page",
	"list_pages",
	"tools/list",
	"tools/call",
	"resources/list",
	"resources/read",
	"initialize",
	"notifications/initialized",
	"ping",
])

export const method = z.object({ method: methodname })

export const search = z.object({ query: z.string().trim().min(1).max(searchmaxquery) })
export const page = z.object({ slug: z.string().trim().min(1).max(300) })
export const list = z.object({
	cursor: z.string().trim().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
}).optional()
export const toolcall = z.object({
	name: z.string().trim().min(1).max(128),
	arguments: z.record(z.unknown()).optional(),
})
export const resource = z.object({
	uri: z.string().trim().min(1).max(512),
})
export const init = z.object({
	protocolVersion: z.string().trim().min(1),
	capabilities: z.record(z.unknown()).optional(),
	clientInfo: z.object({
		name: z.string().trim().min(1),
		version: z.string().trim().min(1),
	}).optional(),
})

const rpcid = z.union([z.string(), z.number(), z.null()]).optional()
export const rpcmethod = z.object({
	jsonrpc: z.literal("2.0"),
	id: rpcid,
	method: methodname,
	params: z.unknown().optional(),
})

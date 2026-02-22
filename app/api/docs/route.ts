import { getAllDocs } from "@/app/docs/_lib/content"
import { sendjson } from "@/app/api/_lib/json"
import { z } from "zod"

const query = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	category: z.preprocess(
		(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
		z.string().trim().min(1).optional(),
	),
})

export async function GET(request: Request) {
	const cache = "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400"
	const url = new URL(request.url)
	const parsed = query.safeParse({
		page: url.searchParams.get("page") ?? undefined,
		limit: url.searchParams.get("limit") ?? undefined,
		category: url.searchParams.get("category") ?? undefined,
	})
	if (!parsed.success) {
		return sendjson(request, { data: [], total: 0, page: 1, pages: 0 }, cache, 400)
	}
	const { page, limit, category } = parsed.data

	let docs = await getAllDocs()

	if (category) {
		docs = docs.filter((d) => d.slug.split("/")[0] === category)
	}

	const total = docs.length
	const pages = Math.ceil(total / limit)
	const start = (page - 1) * limit
	const data = docs.slice(start, start + limit)

	return sendjson(request, { data, total, page, pages }, cache)
}

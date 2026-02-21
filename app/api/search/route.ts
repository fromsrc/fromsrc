import { localSearch, z } from "fromsrc"
import { getAllDocs, getSearchDocs } from "@/app/docs/_lib/content"

const schema = z.object({
	q: z.string().trim().min(1).optional(),
	limit: z.coerce.number().int().min(1).max(50).default(8),
})

export async function GET(request: Request) {
	const url = new URL(request.url)
	const values = schema.parse({
		q: url.searchParams.get("q") ?? undefined,
		limit: url.searchParams.get("limit") ?? undefined,
	})

	if (!values.q) {
		const docs = await getAllDocs()
		return Response.json(docs.slice(0, values.limit))
	}

	const docs = await getSearchDocs()
	const results = localSearch.search(values.q, docs).slice(0, values.limit)
	return Response.json(
		results.map((result) => ({
			slug: result.doc.slug,
			title: result.doc.title,
			description: result.doc.description,
			snippet: result.snippet,
			anchor: result.anchor,
			score: result.score,
		})),
	)
}

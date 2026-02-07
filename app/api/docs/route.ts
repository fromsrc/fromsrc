import { getAllDocs } from "@/app/docs/_lib/content"

export async function GET(request: Request) {
	const url = new URL(request.url)
	const page = Math.max(1, Number(url.searchParams.get("page") ?? 1))
	const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 20)))
	const category = url.searchParams.get("category")

	let docs = await getAllDocs()

	if (category) {
		docs = docs.filter((d) => d.slug.split("/")[0] === category)
	}

	const total = docs.length
	const pages = Math.ceil(total / limit)
	const start = (page - 1) * limit
	const data = docs.slice(start, start + limit)

	return Response.json(
		{ data, total, page, pages },
		{ headers: { "Cache-Control": "public, max-age=300" } },
	)
}

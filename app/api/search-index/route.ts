import { generateSearchIndex } from "fromsrc"
import { NextResponse } from "next/server"
import { getSearchDocs } from "@/app/docs/_lib/content"

export async function GET() {
	const docs = await getSearchDocs()
	const index = generateSearchIndex(docs)

	return NextResponse.json(index, {
		headers: {
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
		},
	})
}

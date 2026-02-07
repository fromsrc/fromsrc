import { createIndex, addDocument, serializeIndex } from "fromsrc"
import { NextResponse } from "next/server"
import { getSearchDocs } from "@/app/docs/_lib/content"

export async function GET() {
	const docs = await getSearchDocs()
	const index = createIndex()
	for (const doc of docs) {
		addDocument(index, {
			path: doc.slug,
			title: doc.title,
			description: doc.description,
			headings: doc.headings?.map((h) => h.text) ?? [],
			content: doc.content,
		})
	}

	return NextResponse.json(JSON.parse(serializeIndex(index)), {
		headers: {
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
		},
	})
}

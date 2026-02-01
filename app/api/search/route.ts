import { getAllDocs } from "@/app/docs/_lib/content"

export async function GET() {
	const docs = await getAllDocs()
	return Response.json(docs)
}

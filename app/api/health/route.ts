import { getAllDocs } from "@/app/docs/_lib/content"

export async function GET() {
	const docs = await getAllDocs()
	return Response.json(
		{
			status: "ok",
			docs: docs.length,
			timestamp: new Date().toISOString(),
		},
		{
			headers: {
				"Cache-Control": "public, max-age=60",
			},
		},
	)
}

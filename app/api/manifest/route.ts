import { generateManifestJson } from "fromsrc"
import { getAllDocs, getDoc } from "@/app/docs/_lib/content"

export async function GET() {
	const metadata = await getAllDocs()
	const results = await Promise.all(
		metadata.map((m) => getDoc(m.slug ? m.slug.split("/") : [])),
	)
	const docs = results.filter((d) => d !== null)
	const json = generateManifestJson(docs)

	return new Response(json, {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600, s-maxage=86400",
		},
	})
}

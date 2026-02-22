import { generateManifest } from "fromsrc"
import { sendjson } from "@/app/api/_lib/json"
import { getAllDocs, getDoc } from "@/app/docs/_lib/content"

const cache = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

export async function GET(request: Request) {
	const metadata = await getAllDocs()
	const results = await Promise.all(
		metadata.map((m) => getDoc(m.slug ? m.slug.split("/") : [])),
	)
	const docs = results.filter((d) => d !== null)
	return sendjson(request, generateManifest(docs), cache)
}

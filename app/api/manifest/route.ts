import { generateManifest } from "fromsrc"
import { sendjson } from "@/app/api/_lib/json"
import { getDocs } from "@/app/docs/_lib/content"

const cache = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"

export async function GET(request: Request) {
	const docs = await getDocs()
	return sendjson(request, generateManifest(docs), cache)
}

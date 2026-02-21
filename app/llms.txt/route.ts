import { generateLlmsIndex } from "fromsrc"
import { send } from "@/app/api/_lib/text"
import { getAllDocs } from "@/app/docs/_lib/content"

const config = {
	title: "fromsrc documentation",
	description: "documentation framework for developers",
	baseUrl: "https://fromsrc.com",
}

export async function GET(request: Request) {
	const docs = await getAllDocs()
	const content = generateLlmsIndex(config, docs)
	return send(request, content, "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800")
}

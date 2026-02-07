import { generateLlmsIndex } from "fromsrc"
import { getAllDocs } from "@/app/docs/_lib/content"

const config = {
	title: "fromsrc documentation",
	description: "documentation framework for developers",
	baseUrl: "https://fromsrc.com",
}

export async function GET() {
	const docs = await getAllDocs()
	const content = generateLlmsIndex(config, docs)

	return new Response(content, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	})
}

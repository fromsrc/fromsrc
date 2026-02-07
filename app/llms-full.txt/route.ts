import { generateLlmsFull } from "fromsrc"
import { getAllDocs, getDoc } from "@/app/docs/_lib/content"

const config = {
	title: "fromsrc documentation",
	description: "documentation framework for developers",
	baseUrl: "https://fromsrc.com",
}

export async function GET() {
	const metas = await getAllDocs()
	const docs = (
		await Promise.all(metas.map((m) => getDoc(m.slug ? m.slug.split("/") : [])))
	).filter(Boolean)

	const content = generateLlmsFull(config, docs)

	return new Response(content, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	})
}

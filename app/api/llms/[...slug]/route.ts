import type { NextRequest } from "next/server"
import { getAllDocs, getDoc } from "@/app/docs/_lib/content"

const headers = {
	"Content-Type": "text/plain; charset=utf-8",
	"Cache-Control": "public, max-age=3600, s-maxage=86400",
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
	const { slug } = await params
	const [doc, docs] = await Promise.all([getDoc(slug), getAllDocs()])

	if (!doc) {
		return new Response("not found", { status: 404, headers })
	}

	const path = slug.join("/")
	const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : ""

	const siblings = docs
		.filter((d) => {
			const dp = d.slug.includes("/") ? d.slug.slice(0, d.slug.lastIndexOf("/")) : ""
			return dp === parent && d.slug !== path
		})
		.map((d) => `- [${d.title}](/docs/${d.slug})`)

	const nav = ["docs", ...slug].map((_s, i, a) => a.slice(0, i + 1).join("/")).join(" > ")

	const parts = [
		`# ${doc.title}`,
		doc.description ? `\n> ${doc.description}` : "",
		`\n${doc.content}`,
		siblings.length ? `\n## Related\n\n${siblings.join("\n")}` : "",
		`\n## Navigation\n\n${nav}`,
	]

	return new Response(parts.filter(Boolean).join("\n"), { headers })
}

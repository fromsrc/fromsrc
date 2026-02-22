import type { NextRequest } from "next/server"
import { slugparams } from "@/app/api/_lib/slug"
import { send } from "@/app/api/_lib/text"
import { getAllDocs, getDoc } from "@/app/docs/_lib/content"

const cache = "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
	const parsed = slugparams.safeParse(await params)
	if (!parsed.success) {
		return send(request, "bad request", cache, 400)
	}
	const { slug } = parsed.data
	const doc = await getDoc(slug)

	if (!doc) {
		return send(request, "not found", cache, 404)
	}
	const docs = await getAllDocs()

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

	return send(request, parts.filter(Boolean).join("\n"), cache)
}

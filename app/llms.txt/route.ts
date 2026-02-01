import { getAllDocs, getDoc } from "@/app/docs/_lib/content"

export async function GET() {
	const metas = await getAllDocs()

	const lines: string[] = [
		"# fromsrc documentation",
		"",
		"documentation framework for developers",
		"",
		"## pages",
		"",
	]

	for (const meta of metas) {
		const url = meta.slug ? `/docs/${meta.slug}` : "/docs"
		lines.push(`- [${meta.title}](${url}): ${meta.description || ""}`)
	}

	lines.push("")
	lines.push("## content")
	lines.push("")

	for (const meta of metas) {
		const doc = await getDoc(meta.slug ? meta.slug.split("/") : [])
		if (!doc) continue

		lines.push(`### ${doc.title}`)
		lines.push("")
		if (doc.description) {
			lines.push(doc.description)
			lines.push("")
		}
		lines.push(doc.content.replace(/^---[\s\S]*?---\n/, "").trim())
		lines.push("")
	}

	return new Response(lines.join("\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	})
}

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

	const docs = await Promise.all(
		metas.map((meta) => getDoc(meta.slug ? meta.slug.split("/") : [])),
	)

	for (let i = 0; i < metas.length; i++) {
		const doc = docs[i]
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

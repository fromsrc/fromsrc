import { getAllDocs } from "@/app/docs/_lib/content"

export async function GET() {
	const docs = await getAllDocs()

	const lines: string[] = [
		"# fromsrc documentation",
		"",
		"documentation framework for developers",
		"",
		"## pages",
		"",
	]

	for (const doc of docs) {
		const url = doc.slug ? `/docs/${doc.slug}` : "/docs"
		lines.push(`- [${doc.title}](${url}): ${doc.description || ""}`)
	}

	lines.push("")
	lines.push("## content")
	lines.push("")

	for (const doc of docs) {
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

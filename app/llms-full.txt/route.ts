import { join } from "node:path"
import { getAllDocs, getDoc } from "fromsrc"

const docsDir = join(process.cwd(), "docs")

export async function GET() {
	const metas = await getAllDocs(docsDir)

	const docs = await Promise.all(
		metas.map((meta) => getDoc(docsDir, meta.slug ? meta.slug.split("/") : [])),
	)

	const sections: string[] = []

	for (let i = 0; i < metas.length; i++) {
		const doc = docs[i]
		if (!doc) continue

		const slug = metas[i]!.slug || "index"
		const header = `# ${doc.title}\nslug: ${slug}`
		const content = doc.content.replace(/^---[\s\S]*?---\n/, "").trim()

		sections.push(`${header}\n\n${content}`)
	}

	return new Response(sections.join("\n\n---\n\n"), {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	})
}

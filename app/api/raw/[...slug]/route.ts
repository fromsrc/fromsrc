import { join } from "node:path"
import { getDoc } from "fromsrc"

const docsDir = join(process.cwd(), "docs")

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
	const { slug } = await params

	const doc = await getDoc(docsDir, slug)
	if (!doc) {
		return new Response(null, { status: 404 })
	}

	return new Response(doc.content, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	})
}

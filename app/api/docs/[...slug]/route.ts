import { getDoc } from "@/app/docs/_lib/content"

interface Props {
	params: Promise<{ slug: string[] }>
}

export async function GET(_request: Request, { params }: Props) {
	const { slug } = await params
	const path = slug.join("/").replace(/\.md$/, "")
	const doc = await getDoc(path.split("/"))

	if (!doc) {
		return new Response("not found", { status: 404 })
	}

	return new Response(doc.content, {
		headers: {
			"Content-Type": "text/markdown; charset=utf-8",
		},
	})
}

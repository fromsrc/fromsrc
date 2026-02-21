import { join } from "node:path"
import { getDoc } from "fromsrc"
import { z } from "zod"
import { send } from "@/app/api/_lib/text"

const docsDir = join(process.cwd(), "docs")
const schema = z.object({ slug: z.array(z.string().min(1)).min(1) })
const cache = "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
	const parsed = schema.safeParse(await params)
	if (!parsed.success) {
		return send(request, "bad request", cache, 400)
	}
	const { slug } = parsed.data

	const doc = await getDoc(docsDir, slug)
	if (!doc) {
		return send(request, "not found", cache, 404)
	}

	return send(request, doc.content, cache)
}

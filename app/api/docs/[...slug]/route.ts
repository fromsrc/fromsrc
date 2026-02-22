import { getDoc } from "@/app/docs/_lib/content"
import { normalizeslug, slugparamsmd } from "@/app/api/_lib/slug"
import { sendmarkdown } from "@/app/api/_lib/text"

interface Props {
	params: Promise<{ slug: string[] }>
}

const cache = "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"

export async function GET(request: Request, { params }: Props) {
	const parsed = slugparamsmd.safeParse(await params)
	if (!parsed.success) return sendmarkdown(request, "bad request", cache, 400)
	const doc = await getDoc(normalizeslug(parsed.data.slug))
	if (!doc) return sendmarkdown(request, "not found", cache, 404)
	return sendmarkdown(request, doc.content, cache)
}

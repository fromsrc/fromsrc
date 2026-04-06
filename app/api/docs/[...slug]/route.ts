import { normalizeSlug, slugParamsMd } from "@/app/api/_lib/slug";
import { sendMarkdown } from "@/app/api/_lib/text";
import { getDoc } from "@/app/docs/_lib/content";

interface Props {
  params: Promise<{ slug: string[] }>;
}

const cache =
  "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: Request, { params }: Props) {
  const parsed = slugParamsMd.safeParse(await params);
  if (!parsed.success) {
    return sendMarkdown(request, "bad request", cache, 400);
  }
  const doc = await getDoc(normalizeSlug(parsed.data.slug));
  if (!doc) {
    return sendMarkdown(request, "not found", cache, 404);
  }
  return sendMarkdown(request, doc.content, cache);
}

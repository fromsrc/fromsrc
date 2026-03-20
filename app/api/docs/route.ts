import { z } from "zod";

import { sendjson } from "@/app/api/_lib/json";
import { getAllDocs } from "@/app/docs/_lib/content";

const query = z.object({
  category: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).optional()
  ),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  page: z.coerce.number().int().min(1).default(1),
});

export async function GET(request: Request) {
  const cache =
    "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400";
  const url = new URL(request.url);
  const parsed = query.safeParse({
    category: url.searchParams.get("category") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
  });
  if (!parsed.success) {
    return sendjson(
      request,
      { data: [], page: 1, pages: 0, total: 0 },
      cache,
      400
    );
  }
  const { page, limit, category } = parsed.data;

  let docs = await getAllDocs();

  if (category) {
    docs = docs.filter((d) => d.slug.split("/")[0] === category);
  }

  const total = docs.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = docs.slice(start, start + limit);

  return sendjson(request, { data, page, pages, total }, cache);
}

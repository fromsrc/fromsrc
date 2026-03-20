import { generateLlmsFull } from "fromsrc";

import { siteurl } from "@/app/_lib/site";
import { send } from "@/app/api/_lib/text";
import { getAllDocs, getDoc } from "@/app/docs/_lib/content";

const config = {
  baseUrl: siteurl(),
  description: "documentation framework for developers",
  title: "fromsrc documentation",
};

export async function GET(request: Request) {
  const metas = await getAllDocs();
  const results = await Promise.all(
    metas.map((m) => getDoc(m.slug ? m.slug.split("/") : []))
  );
  const docs = results.filter((d) => d !== null);

  const content = generateLlmsFull(config, docs);
  return send(
    request,
    content,
    "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"
  );
}

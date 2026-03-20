import { generateLlmsIndex } from "fromsrc";

import { siteurl } from "@/app/_lib/site";
import { send } from "@/app/api/_lib/text";
import { getAllDocs } from "@/app/docs/_lib/content";

const config = {
  baseUrl: siteurl(),
  description: "documentation framework for developers",
  title: "fromsrc documentation",
};

export async function GET(request: Request) {
  const docs = await getAllDocs();
  const content = generateLlmsIndex(config, docs);
  return send(
    request,
    content,
    "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800"
  );
}

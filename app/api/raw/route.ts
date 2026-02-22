import { join } from "node:path";
import { getDoc } from "fromsrc";
import { send } from "@/app/api/_lib/text";

const docsDir = join(process.cwd(), "docs");
const cache = "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: Request) {
	const doc = await getDoc(docsDir, []);
	if (!doc) {
		return send(request, "not found", cache, 404);
	}
	return send(request, doc.content, cache);
}

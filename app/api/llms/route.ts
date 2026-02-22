import type { NextRequest } from "next/server";
import { send } from "@/app/api/_lib/text";
import { getAllDocs, getDoc } from "@/app/docs/_lib/content";

const cache = "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800";

export async function GET(request: NextRequest) {
	const slug: string[] = [];
	const doc = await getDoc(slug);
	if (!doc) {
		return send(request, "not found", cache, 404);
	}
	const docs = await getAllDocs();
	const path = slug.join("/");
	const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";

	const siblings = docs
		.filter((item) => {
			const itemParent = item.slug.includes("/") ? item.slug.slice(0, item.slug.lastIndexOf("/")) : "";
			return itemParent === parent && item.slug !== path;
		})
		.map((item) => `- [${item.title}](/docs/${item.slug})`);

	const nav = ["docs"].join(" > ");
	const parts = [
		`# ${doc.title}`,
		doc.description ? `\n> ${doc.description}` : "",
		`\n${doc.content}`,
		siblings.length ? `\n## Related\n\n${siblings.join("\n")}` : "",
		`\n## Navigation\n\n${nav}`,
	];
	return send(request, parts.filter(Boolean).join("\n"), cache);
}

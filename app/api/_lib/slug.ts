import { z } from "fromsrc";
import { segmentmdregex, segmentregex } from "@/app/api/_lib/slugpattern";

const segment = z.string().trim().min(1).max(120).regex(segmentregex);
const segmentmd = z.string().trim().min(1).max(124).regex(segmentmdregex);

export const slugparams = z.object({ slug: z.array(segment).min(1) });
export const slugparamsmd = z.object({ slug: z.array(segmentmd).min(1) });

export function normalizeslug(slug: string[]): string[] {
	if (slug.length === 0) return slug;
	const next = [...slug];
	const last = next[next.length - 1];
	if (!last) return next;
	next[next.length - 1] = last.replace(/\.md$/, "");
	return next;
}

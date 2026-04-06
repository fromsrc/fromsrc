import { z } from "fromsrc";

import { segmentMdRegex, segmentRegex } from "@/app/api/_lib/slugpattern";

const segment = z.string().trim().min(1).max(120).regex(segmentRegex);
const segmentMd = z.string().trim().min(1).max(124).regex(segmentMdRegex);

export const slugParams = z.object({ slug: z.array(segment).default([]) });
export const slugParamsMd = z.object({ slug: z.array(segmentMd).default([]) });

export function normalizeSlug(slug: string[]): string[] {
  if (slug.length === 0) {
    return slug;
  }
  const next = [...slug];
  const last = next.at(-1);
  if (!last) {
    return next;
  }
  next[next.length - 1] = last.replace(/\.md$/, "");
  return next;
}

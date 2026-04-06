import { join } from "node:path";

import { getAllDocs, lastModifiedAll } from "fromsrc";
import type { MetadataRoute } from "next";

import { siteUrl } from "./_lib/site";

const base = siteUrl();
const docsDir = join(process.cwd(), "docs");

function filePath(slug: string): string {
  return join(docsDir, `${slug === "" ? "index" : slug}.mdx`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const docs = await getAllDocs(docsDir);
  const paths = docs.map((doc) => filePath(doc.slug));
  const dates = lastModifiedAll(paths);

  const docEntries: MetadataRoute.Sitemap = docs.map((doc) => ({
    changeFrequency: doc.slug.startsWith("api/") ? "weekly" : "monthly",
    lastModified: dates.get(filePath(doc.slug)) ?? new Date(),
    priority:
      doc.slug === "" ? 0.9 : doc.slug.startsWith("components/") ? 0.7 : 0.8,
    url: `${base}/docs${doc.slug ? `/${doc.slug}` : ""}`,
  }));

  return [
    {
      changeFrequency: "monthly",
      lastModified: new Date(),
      priority: 1,
      url: base,
    },
    ...docEntries,
  ];
}

import type { Doc } from "./content";
import { extractHeadings } from "./content";

export interface DocManifest {
  version: number;
  generated: string;
  pages: ManifestPage[];
}

export interface ManifestPage {
  slug: string;
  title: string;
  description?: string;
  headings: { depth: number; text: string; id: string }[];
  wordCount: number;
}

function countWords(content: string): number {
  return content
    .replaceAll(/```[\s\S]*?```/g, "")
    .replaceAll(/<[^>]+>/g, " ")
    .replaceAll(/import\s+.*?from\s+['"][^'"]+['"];?/g, "")
    .replaceAll(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.length > 0).length;
}

function toManifestPage(doc: Doc): ManifestPage {
  const headings = extractHeadings(doc.content).map((h) => ({
    depth: h.level,
    id: h.id,
    text: h.text,
  }));

  return {
    description: doc.description,
    headings,
    slug: doc.slug,
    title: doc.title,
    wordCount: countWords(doc.content),
  };
}

export function generateManifest(docs: Doc[]): DocManifest {
  return {
    generated: new Date().toISOString(),
    pages: docs.map(toManifestPage),
    version: 1,
  };
}

export function generateManifestJson(docs: Doc[]): string {
  return JSON.stringify(generateManifest(docs), null, 2);
}

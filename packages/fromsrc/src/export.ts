import type { Doc, DocMeta } from "./content";

function escape(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function exportMarkdown(docs: Doc[]): string {
  return docs
    .map((doc) => `# ${doc.title}\n\n${doc.content.trim()}`)
    .join("\n\n---\n\n");
}

export function exportJson(docs: Doc[]): string {
  return JSON.stringify(
    docs.map((doc) => ({
      content: doc.content,
      description: doc.description,
      slug: doc.slug,
      title: doc.title,
    })),
    null,
    2
  );
}

export function exportCsv(docs: DocMeta[]): string {
  const header = "slug,title,description";
  const rows = docs.map(
    (doc) =>
      `${escape(doc.slug)},${escape(doc.title)},${escape(doc.description ?? "")}`
  );
  return [header, ...rows].join("\n");
}

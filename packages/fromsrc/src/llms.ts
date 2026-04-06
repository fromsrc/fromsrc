import type { Doc, DocMeta } from "./content";

/** Configuration for generating llms.txt files. */
export interface LlmsConfig {
  title: string;
  description: string;
  baseUrl: string;
  docsPath?: string;
}

function clean(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

function formatEntry(baseUrl: string, docsPath: string, doc: DocMeta): string {
  const path = doc.slug ? `${docsPath}/${doc.slug}` : docsPath;
  const url = `${baseUrl}${path}`;
  const desc = doc.description ? `: ${escapeMarkdown(doc.description)}` : "";
  return `- [${escapeMarkdown(doc.title)}](${url})${desc}`;
}

/** Generates an llms.txt index with linked page titles and descriptions. */
export function generateLlmsIndex(config: LlmsConfig, docs: DocMeta[]): string {
  const docsPath = clean(config.docsPath ?? "/docs");
  const lines = [
    `# ${config.title}`,
    "",
    config.description,
    "",
    "## pages",
    "",
  ];
  for (const doc of docs) {
    lines.push(formatEntry(config.baseUrl, docsPath, doc));
  }
  return lines.join("\n");
}

/** Generates a full llms.txt with page index and inline content for each page. */
export function generateLlmsFull(config: LlmsConfig, docs: Doc[]): string {
  const docsPath = clean(config.docsPath ?? "/docs");
  const lines = [
    `# ${config.title}`,
    "",
    config.description,
    "",
    "## pages",
    "",
  ];
  for (const doc of docs) {
    lines.push(formatEntry(config.baseUrl, docsPath, doc));
  }
  lines.push("", "## content");
  for (const doc of docs) {
    lines.push("", `### ${escapeMarkdown(doc.title)}`);
    if (doc.description) {
      lines.push("", escapeMarkdown(doc.description));
    }
    lines.push("", doc.content.trim());
  }
  return lines.join("\n");
}

function escapeMarkdown(text: string): string {
  return text.replaceAll(/[[\]()\\]/g, "\\$&");
}

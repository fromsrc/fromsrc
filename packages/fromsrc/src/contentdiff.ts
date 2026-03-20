export interface ContentChange {
  type: "added" | "removed" | "modified";
  path: string;
  title?: string;
}

export interface ContentDiff {
  added: ContentChange[];
  removed: ContentChange[];
  modified: ContentChange[];
  summary: string;
}

function extractTitle(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1];
}

export function contentFromDocs(
  docs: { slug: string; content: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const doc of docs) {
    map.set(doc.slug, doc.content);
  }
  return map;
}

export function diffContent(
  before: Map<string, string>,
  after: Map<string, string>
): ContentDiff {
  const added: ContentChange[] = [];
  const removed: ContentChange[] = [];
  const modified: ContentChange[] = [];

  for (const [path, content] of after) {
    if (!before.has(path)) {
      added.push({ path, title: extractTitle(content), type: "added" });
    } else if (before.get(path) !== content) {
      modified.push({ path, title: extractTitle(content), type: "modified" });
    }
  }

  for (const [path, content] of before) {
    if (!after.has(path)) {
      removed.push({ path, title: extractTitle(content), type: "removed" });
    }
  }

  const summary = `${added.length} added, ${removed.length} removed, ${modified.length} modified`;
  return { added, modified, removed, summary };
}

export function formatChangelog(diff: ContentDiff): string {
  const sections: string[] = [];

  if (diff.added.length > 0) {
    sections.push("## Added\n");
    for (const c of diff.added) {
      sections.push(`- ${c.title ?? c.path}`);
    }
  }

  if (diff.removed.length > 0) {
    sections.push("## Removed\n");
    for (const c of diff.removed) {
      sections.push(`- ${c.title ?? c.path}`);
    }
  }

  if (diff.modified.length > 0) {
    sections.push("## Modified\n");
    for (const c of diff.modified) {
      sections.push(`- ${c.title ?? c.path}`);
    }
  }

  sections.push(`\n${diff.summary}`);
  return sections.join("\n");
}

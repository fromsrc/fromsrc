/** Single changelog item within a release entry */
export interface ChangelogItem {
  type: "added" | "changed" | "fixed" | "removed" | "deprecated" | "security";
  description: string;
}

/** Parsed changelog entry for a single version release */
export interface ChangelogEntry {
  version: string;
  date: string;
  title?: string;
  description: string;
  type: "major" | "minor" | "patch" | "prerelease";
  breaking?: boolean;
  items: ChangelogItem[];
}

/** Configuration for changelog parsing */
export interface ChangelogConfig {
  file?: string;
}

const sectionMap: Record<string, ChangelogItem["type"]> = {
  added: "added",
  changed: "changed",
  deprecated: "deprecated",
  fixed: "fixed",
  removed: "removed",
  security: "security",
};

function detectType(
  version: string,
  previous?: string
): ChangelogEntry["type"] {
  if (version.includes("-")) {
    return "prerelease";
  }
  if (!previous) {
    return "major";
  }
  const [ma, mi] = version.split(".").map(Number);
  const [pma, pmi] = previous.split(".").map(Number);
  if (ma !== pma) {
    return "major";
  }
  if (mi !== pmi) {
    return "minor";
  }
  return "patch";
}

function detectBreaking(items: ChangelogItem[]): boolean {
  return items.some((i) => /\bBREAKING\b/i.test(i.description));
}

/** Parse a keep-a-changelog formatted string into structured entries */
export function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  const blocks = content.split(/^## /m).slice(1);

  for (const block of blocks) {
    const header = block.match(/^\[([^\]]+)\]\s*-\s*(\S+)(.*)/);
    if (!header) {
      continue;
    }

    const version = header[1];
    const date = header[2];
    if (!version || !date) {
      continue;
    }
    const rest = header[3] ?? "";
    const title = rest.trim() || undefined;
    const items: ChangelogItem[] = [];
    let currentType: ChangelogItem["type"] | null = null;

    for (const line of block.split("\n").slice(1)) {
      const section = line.match(/^### (.+)/);
      if (section) {
        const heading = section[1];
        currentType = heading
          ? (sectionMap[heading.toLowerCase()] ?? null)
          : null;
        continue;
      }
      const item = line.match(/^- (.+)/);
      if (item && currentType) {
        const description = item[1];
        if (description) {
          items.push({ description: description.trim(), type: currentType });
        }
      }
    }

    entries.push({
      breaking: detectBreaking(items),
      date,
      description: items.map((i) => i.description).join(", "),
      items,
      title,
      type: "patch",
      version,
    });
  }

  entries.sort((a, b) => b.date.localeCompare(a.date));

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) {
      continue;
    }
    const prev = entries[i + 1];
    entry.type = detectType(entry.version, prev?.version);
  }

  return entries;
}

function escape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Generate an RSS feed from changelog entries */
export function generateChangelogRss(
  config: { title: string; baseUrl: string; description: string },
  entries: ChangelogEntry[]
): string {
  const items = entries
    .map(
      (e) =>
        `<item><title>${escape(e.version)}${e.title ? ` - ${escape(e.title)}` : ""}</title>` +
        `<link>${config.baseUrl}/changelog#${e.version}</link>` +
        `<pubDate>${new Date(e.date).toUTCString()}</pubDate>` +
        `<description>${escape(e.items.map((i) => `${i.type}: ${i.description}`).join("\n"))}</description></item>`
    )
    .join("\n");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0"><channel>` +
    `<title>${escape(config.title)}</title>` +
    `<link>${config.baseUrl}</link>` +
    `<description>${escape(config.description)}</description>` +
    `${items}</channel></rss>`
  );
}

/** Get the most recent changelog entry */
export function latestVersion(
  entries: ChangelogEntry[]
): ChangelogEntry | undefined {
  return entries[0];
}

/** Filter changelog entries by release type */
export function filterByType(
  entries: ChangelogEntry[],
  type: ChangelogEntry["type"]
): ChangelogEntry[] {
  return entries.filter((e) => e.type === type);
}

/** Filter entries that contain breaking changes */
export function hasBreaking(entries: ChangelogEntry[]): ChangelogEntry[] {
  return entries.filter((e) => e.breaking);
}

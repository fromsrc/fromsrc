import type { SearchDoc } from "./content";
import { isRecord } from "./guard";
import type { SearchAdapter, SearchResult } from "./search";

export interface OramaConfig {
  endpoint: string;
  readonly key?: string;
  index?: string;
  headers?: Record<string, string>;
}

interface Hit {
  slug?: string;
  path?: string;
  title?: string;
  description?: string;
  content?: string;
  anchor?: string;
  heading?: string;
  snippet?: string;
  score?: number;
  document?: Hit;
}
const MAX_DEPTH = 10;

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function parseHit(value: unknown, depth = 0): Hit | null {
  if (!isRecord(value)) {
    return null;
  }
  if (depth > MAX_DEPTH) {
    return null;
  }
  const nested = isRecord(value.document)
    ? parseHit(value.document, depth + 1)
    : null;
  const document = nested ?? undefined;
  return {
    anchor: getString(value.anchor),
    content: getString(value.content),
    description: getString(value.description),
    document,
    heading: getString(value.heading),
    path: getString(value.path),
    score: getNumber(value.score),
    slug: getString(value.slug),
    snippet: getString(value.snippet),
    title: getString(value.title),
  };
}

function parseHits(value: unknown): Hit[] {
  if (Array.isArray(value)) {
    return value.map(parseHit).filter((item): item is Hit => item !== null);
  }
  if (!isRecord(value)) {
    return [];
  }
  const hits = Array.isArray(value.hits)
    ? value.hits
    : Array.isArray(value.results)
      ? value.results
      : [];
  return hits.map(parseHit).filter((item): item is Hit => item !== null);
}

function normalize(doc: SearchDoc): SearchDoc {
  return {
    content: doc.content ?? "",
    description: doc.description,
    headings: doc.headings,
    slug: doc.slug,
    title: doc.title,
  };
}

function fallback(docs: SearchDoc[], limit: number): SearchResult[] {
  return docs.slice(0, limit).map((doc) => ({ doc, score: 0 }));
}

function mapHit(entry: Hit, index: number, total: number): SearchResult | null {
  const source = entry.document ?? entry;
  const slug = source.slug ?? source.path;
  const title = source.title ?? source.heading ?? slug;
  if (!slug || !title) {
    return null;
  }
  return {
    anchor: source.anchor,
    doc: normalize({
      content: source.content ?? "",
      description: source.description,
      slug,
      title,
    }),
    heading: source.heading,
    score: source.score ?? Math.max(1, total - index),
    snippet: source.snippet ?? source.description ?? source.content,
  };
}

export function createOramaAdapter(config: OramaConfig): SearchAdapter {
  return {
    async search(
      query: string,
      docs: SearchDoc[],
      limit = 8
    ): Promise<SearchResult[]> {
      const value = query.trim();
      if (!value) {
        return fallback(docs, limit);
      }
      const response = await fetch(config.endpoint, {
        body: JSON.stringify({
          index: config.index,
          limit,
          query: value,
          term: value,
        }),
        headers: {
          "content-type": "application/json",
          ...(config.key ? { authorization: `Bearer ${config.key}` } : {}),
          ...config.headers,
        },
        method: "POST",
      });
      if (!response.ok) {
        return [];
      }
      const json = await response.json();
      const hits = parseHits(json);
      const result: SearchResult[] = [];
      for (let i = 0; i < hits.length; i++) {
        const hit = hits[i];
        if (!hit) {
          continue;
        }
        const item = mapHit(hit, i, hits.length);
        if (item) {
          result.push(item);
        }
      }
      return result;
    },
  };
}

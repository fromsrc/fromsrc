import type { SearchDoc } from "./content";
import { isRecord } from "./guard";
import type { SearchAdapter, SearchResult } from "./search";

export interface AlgoliaConfig {
  appId: string;
  readonly key: string;
  index: string;
  attributes?: string[];
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
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

function parseHits(value: unknown): Record<string, unknown>[] {
  if (!isRecord(value)) {
    return [];
  }
  const { hits } = value;
  if (!Array.isArray(hits)) {
    return [];
  }
  return hits.filter(isRecord);
}

function mapHit(
  hit: Record<string, unknown>,
  index: number,
  total: number
): SearchResult | null {
  const snippetResult = isRecord(hit._snippetResult)
    ? hit._snippetResult
    : null;
  const contentMeta =
    snippetResult && isRecord(snippetResult.content)
      ? snippetResult.content
      : null;
  const descriptionMeta =
    snippetResult && isRecord(snippetResult.description)
      ? snippetResult.description
      : null;
  const headingMeta =
    snippetResult && isRecord(snippetResult.heading)
      ? snippetResult.heading
      : null;
  const slug = getString(hit.slug) ?? getString(hit.path);
  const heading = getString(hit.heading);
  const title = getString(hit.title) ?? heading ?? slug;
  if (!slug || !title) {
    return null;
  }
  const snippet =
    getString(contentMeta?.value) ??
    getString(descriptionMeta?.value) ??
    getString(headingMeta?.value) ??
    getString(hit.description) ??
    getString(hit.content);
  return {
    anchor: getString(hit.anchor),
    doc: normalize({
      content: getString(hit.content) ?? "",
      description: getString(hit.description),
      slug,
      title,
    }),
    heading,
    score: Math.max(1, total - index),
    snippet,
  };
}

export function createAlgoliaAdapter(config: AlgoliaConfig): SearchAdapter {
  const body = {
    attributesToRetrieve: config.attributes ?? [
      "slug",
      "path",
      "title",
      "description",
      "content",
      "anchor",
      "heading",
    ],
    attributesToSnippet: ["content:24", "description:18", "heading:18"],
  };
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
      const url = `https://${config.appId}-dsn.algolia.net/1/indexes/${encodeURIComponent(config.index)}/query`;
      const response = await fetch(url, {
        body: JSON.stringify({ ...body, hitsPerPage: limit, query: value }),
        headers: {
          "content-type": "application/json",
          "x-algolia-api-key": config.key,
          "x-algolia-application-id": config.appId,
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

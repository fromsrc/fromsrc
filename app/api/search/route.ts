import { localSearch, z } from "fromsrc";
import { searchMaxQuery } from "fromsrc/searchpolicy";

import { sendJson, sendJsonWithHeaders } from "@/app/api/_lib/json";
import { getAllDocs, getSearchDocs } from "@/app/docs/_lib/content";

const schema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(8),
  q: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(searchMaxQuery).optional()
  ),
});

interface Entry {
  at: number;
  value: Row[];
}

interface CacheEntry<T> {
  at: number;
  value: T;
}

interface Row {
  slug: string;
  title: string;
  description?: string;
  snippet?: string;
  anchor?: string;
  heading?: string;
  score: number;
}

interface ComputeV {
  rows: Row[];
  docsHit: boolean;
}

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<ComputeV>>();
let allCache: CacheEntry<Awaited<ReturnType<typeof getAllDocs>>> | null = null;
let searchCache: CacheEntry<Awaited<ReturnType<typeof getSearchDocs>>> | null =
  null;
let allInflight: Promise<Awaited<ReturnType<typeof getAllDocs>>> | null = null;
let searchInflight: Promise<Awaited<ReturnType<typeof getSearchDocs>>> | null =
  null;
const ttl = 1000 * 60 * 5;
const max = 200;
const cacheControl =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

function normalize(text: string | undefined): string {
  return text?.toLowerCase().replaceAll(/\s+/g, " ").trim() ?? "";
}

function get(key: string): Row[] | null {
  const item = cache.get(key);
  if (!item) {
    return null;
  }
  if (Date.now() - item.at > ttl) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

function set(key: string, value: Row[]): Row[] {
  if (cache.size >= max) {
    const first = cache.keys().next();
    if (!first.done) {
      cache.delete(first.value);
    }
  }
  cache.set(key, { at: Date.now(), value });
  return value;
}

function valid<T>(entry: CacheEntry<T> | null): boolean {
  return Boolean(entry && Date.now() - entry.at <= ttl);
}

function docCacheHit(query: string): boolean {
  return query ? valid(searchCache) : valid(allCache);
}

async function loadAll(): Promise<{
  value: Awaited<ReturnType<typeof getAllDocs>>;
  hit: boolean;
}> {
  if (valid(allCache) && allCache) {
    return { hit: true, value: allCache.value };
  }
  const pending = allInflight ?? getAllDocs();
  if (!allInflight) {
    allInflight = pending;
  }
  const value = await pending.finally(() => {
    if (allInflight === pending) {
      allInflight = null;
    }
  });
  allCache = { at: Date.now(), value };
  return { hit: false, value };
}

async function loadSearch(): Promise<{
  value: Awaited<ReturnType<typeof getSearchDocs>>;
  hit: boolean;
}> {
  if (valid(searchCache) && searchCache) {
    return { hit: true, value: searchCache.value };
  }
  const pending = searchInflight ?? getSearchDocs();
  if (!searchInflight) {
    searchInflight = pending;
  }
  const value = await pending.finally(() => {
    if (searchInflight === pending) {
      searchInflight = null;
    }
  });
  searchCache = { at: Date.now(), value };
  return { hit: false, value };
}

async function compute(
  query: string | undefined,
  limit: number
): Promise<ComputeV> {
  if (!query) {
    const docs = await loadAll();
    return {
      docsHit: docs.hit,
      rows: docs.value.slice(0, limit).map((doc) => ({
        anchor: undefined,
        description: doc.description,
        score: 0,
        slug: doc.slug,
        snippet: undefined,
        title: doc.title,
      })),
    };
  }
  const docs = await loadSearch();
  const results = await localSearch.search(query, docs.value, limit);
  return {
    docsHit: docs.hit,
    rows: results.map((result) => ({
      anchor: result.anchor,
      description: result.doc.description,
      heading: result.heading,
      score: result.score,
      slug: result.doc.slug,
      snippet: result.snippet,
      title: result.doc.title,
    })),
  };
}

export async function GET(request: Request) {
  const started = performance.now();
  const url = new URL(request.url);
  const parsed = schema.safeParse({
    limit: url.searchParams.get("limit") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
  });
  if (!parsed.success) {
    return sendJson(request, [], cacheControl, 400);
  }
  const values = parsed.data;
  const query = normalize(values.q);
  const key = `${query}::${values.limit}`;
  const cached = get(key);
  if (cached) {
    const duration = performance.now() - started;
    return sendJsonWithHeaders(request, cached, cacheControl, {
      "Server-Timing": `search;dur=${duration.toFixed(2)}`,
      "X-Search-Cache": "hit",
      "X-Search-Docs-Cache": docCacheHit(query) ? "hit" : "miss",
      "X-Search-Result-Count": String(cached.length),
    });
  }

  const pending =
    inflight.get(key) ?? compute(query || undefined, values.limit);
  if (!inflight.has(key)) {
    inflight.set(key, pending);
  }
  const computed = await pending.finally(() => {
    if (inflight.get(key) === pending) {
      inflight.delete(key);
    }
  });
  const duration = performance.now() - started;
  return sendJsonWithHeaders(request, set(key, computed.rows), cacheControl, {
    "Server-Timing": `search;dur=${duration.toFixed(2)}`,
    "X-Search-Cache": "miss",
    "X-Search-Docs-Cache": computed.docsHit ? "hit" : "miss",
    "X-Search-Result-Count": String(computed.rows.length),
  });
}

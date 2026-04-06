import matter from "gray-matter";

import type { DocMeta, Heading, SearchDoc } from "./content";
import { z } from "./schema";

/** Interface for providing documentation content to fromsrc. */
export interface ContentSource {
  list(): Promise<DocMeta[]>;
  get(
    slug: string[]
  ): Promise<{ content: string; data: Record<string, unknown> } | null>;
  search?(): Promise<SearchDoc[]>;
}

/** Configuration for fetching documentation from a remote fromsrc instance. */
export interface RemoteSourceConfig {
  baseUrl: string;
  index?: string;
  docsEndpoint?: string;
  rawEndpoint?: string;
  searchIndexEndpoint?: string;
  ttl?: number;
}

/** Creates a content source that fetches docs from a remote URL with TTL caching. */
export function createRemoteSource(config: RemoteSourceConfig): ContentSource {
  const base = trimSlash(config.baseUrl);
  const ttl = config.ttl ?? 1000 * 60 * 5;
  const indexUrl = config.index || `${base}/llms.txt`;
  const docsUrl = config.docsEndpoint || `${base}/api/docs?limit=1000`;
  const rawUrl = trimSlash(config.rawEndpoint || `${base}/api/raw`);
  const searchIndexUrl =
    config.searchIndexEndpoint || `${base}/api/search-index`;
  const listCache = createCache<DocMeta[]>(ttl);
  const fileCache = createCache<{
    content: string;
    data: Record<string, unknown>;
  }>(ttl);
  const searchCache = createCache<SearchDoc[]>(ttl);

  return {
    async get(slug) {
      const path = slug.length === 0 ? "index" : slug.join("/");
      const cached = fileCache.get(path);
      if (cached) {return cached;}
      const normalized =
        slug.length === 0
          ? "index"
          : slug.map((part) => encodeURIComponent(part)).join("/");
      const res = await fetch(`${rawUrl}/${normalized}`);
      if (!res.ok) {return null;}
      const source = await res.text();
      const parsed = parseFrontmatter(source);
      const docs = await this.list();
      const item = docs.find(
        (doc) => doc.slug === path || (path === "index" && doc.slug === "")
      );
      const data: Record<string, unknown> = { ...parsed.data };
      if (item?.title) {data.title = item.title;}
      if (item?.description) {data.description = item.description;}
      const value = { content: parsed.content, data };
      fileCache.set(path, value);
      return value;
    },

    async list() {
      const cached = listCache.get("list");
      if (cached) {return cached;}
      const docs = await loadDocs(docsUrl);
      if (docs.length > 0) {
        listCache.set("list", docs);
        return docs;
      }
      const llms = await loadLlms(indexUrl, base);
      listCache.set("list", llms);
      return llms;
    },

    async search() {
      const cached = searchCache.get("search");
      if (cached) {return cached;}
      const docs = await loadSearch(searchIndexUrl);
      searchCache.set("search", docs);
      return docs;
    },
  };
}

interface CacheEntry<T> {
  data: T;
  at: number;
}

function createCache<T>(ttl: number) {
  const store = new Map<string, CacheEntry<T>>();
  return {
    get(key: string): T | null {
      const value = store.get(key);
      if (!value) {
        return null;
      }
      if (Date.now() - value.at > ttl) {
        store.delete(key);
        return null;
      }
      return value.data;
    },
    set(key: string, data: T): void {
      store.set(key, { at: Date.now(), data });
    },
  };
}

const docsSchema = z.object({
  data: z.array(
    z.object({
      description: z.string().optional(),
      slug: z.string(),
      title: z.string(),
    })
  ),
});

const indexSchema = z.object({
  documents: z.array(
    z.object({
      content: z.string(),
      description: z.string().optional(),
      headings: z.array(z.string()),
      path: z.string(),
      title: z.string(),
    })
  ),
});

async function loadDocs(url: string): Promise<DocMeta[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    const data = docsSchema.parse(await res.json());
    return data.data;
  } catch {
    return [];
  }
}

async function loadSearch(url: string): Promise<SearchDoc[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    const data = indexSchema.parse(await res.json());
    return data.documents.map((doc) => ({
      content: doc.content,
      description: doc.description,
      headings: headings(doc.headings),
      slug: normalizePath(doc.path),
      title: doc.title,
    }));
  } catch {
    return [];
  }
}

async function loadLlms(url: string, base: string): Promise<DocMeta[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    const text = await res.text();
    return parseLlmsIndex(text, base);
  } catch {
    return [];
  }
}

function parseLlmsIndex(text: string, baseUrl: string): DocMeta[] {
  const docs: DocMeta[] = [];

  for (const line of text.split("\n")) {
    const match = line.match(/^- \[(.+?)\]\((.+?)\)(?:: (.+))?$/);
    if (!match) {
      continue;
    }

    const title = match[1];
    const url = match[2];
    if (!title || !url) {
      continue;
    }
    const description = match[3]?.trim();
    const slug = slugFrom(url, baseUrl);
    if (!slug && url !== `${baseUrl}/docs`) {
      continue;
    }

    docs.push({ description, slug, title });
  }

  return docs;
}

function slugFrom(value: string, base: string): string {
  const parsed = parseUrl(value, base);
  if (!parsed) {
    return "";
  }
  const path = parsed.pathname
    .replace(/^\/docs\/?/, "")
    .replace(/\/$/, "")
    .trim();
  return normalizePath(path);
}

function parseUrl(value: string, base: string): URL | null {
  try {
    return new URL(value, base);
  } catch {
    return null;
  }
}

function normalizePath(value: string): string {
  return value.replace(/^\/+/, "").replace(/\/+$/, "");
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function headingId(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/\s+/g, "-")
    .replaceAll(/[^a-z0-9_-]/g, "")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

function parseFrontmatter(source: string): {
  content: string;
  data: Record<string, unknown>;
} {
  try {
    const parsed = matter(source);
    const data =
      typeof parsed.data === "object" && parsed.data !== null
        ? { ...parsed.data }
        : {};
    return { content: parsed.content, data };
  } catch {
    return { content: source, data: {} };
  }
}

function headings(values: string[]): Heading[] | undefined {
  if (values.length === 0) {
    return undefined;
  }
  const seen = new Map<string, number>();
  const list: Heading[] = [];
  for (const text of values) {
    const base = headingId(text);
    if (!base) {
      continue;
    }
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    list.push({ id, level: 2, text });
  }
  return list.length > 0 ? list : undefined;
}

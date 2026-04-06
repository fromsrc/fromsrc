import {
  addDocument,
  createIndex,
  deserializeIndex,
  serializeIndex,
} from "fromsrc";
import type { SearchIndex } from "fromsrc";

import { sendJsonWithHeaders } from "@/app/api/_lib/json";
import { getSearchDocs } from "@/app/docs/_lib/content";

interface entry {
  at: number;
  value: IndexPayload;
}

interface IndexPayload {
  documents: SearchIndex["documents"];
  terms: [string, number[]][];
  version: number;
}

const ttl = 1000 * 60 * 5;
const cachecontrol =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
let cached: entry | null = null;
let inflight: Promise<IndexPayload> | null = null;

async function build(): Promise<IndexPayload> {
  const docs = await getSearchDocs();
  const index = createIndex();
  for (const doc of docs) {
    addDocument(index, {
      content: doc.content,
      description: doc.description,
      headings: doc.headings?.map((h) => h.text) ?? [],
      path: doc.slug,
      title: doc.title,
    });
  }
  const validated = deserializeIndex(serializeIndex(index));
  return {
    documents: validated.documents,
    terms: [...validated.terms.entries()],
    version: validated.version,
  };
}

async function load(): Promise<IndexPayload> {
  if (cached && Date.now() - cached.at < ttl) {
    return cached.value;
  }
  const pending = inflight ?? build();
  if (!inflight) {
    inflight = pending;
  }
  const value = await pending.finally(() => {
    if (inflight === pending) {
      inflight = null;
    }
  });
  cached = { at: Date.now(), value };
  return value;
}

export async function GET(request: Request) {
  const started = performance.now();
  const hit = Boolean(cached && Date.now() - cached.at < ttl);
  const value = await load();
  const duration = performance.now() - started;
  return sendJsonWithHeaders(request, value, cachecontrol, {
    "Server-Timing": `index;dur=${duration.toFixed(2)}`,
    "X-Search-Index-Cache": hit ? "hit" : "miss",
    "X-Search-Index-Count": String(value.documents.length),
  });
}

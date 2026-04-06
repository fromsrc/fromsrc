import { isRecord } from "./guard";

export interface SearchDocument {
  path: string;
  title: string;
  description?: string;
  headings: string[];
  content: string;
  tags?: string[];
}

export interface SearchIndex {
  documents: SearchDocument[];
  terms: Map<string, number[]>;
  version: number;
  config?: IndexConfig;
}

export interface IndexConfig {
  stemming?: boolean;
  stopWords?: string[];
  minLength?: number;
}

const DEFAULT_STOPS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "and",
  "or",
  "but",
  "not",
  "with",
  "this",
  "that",
]);

/** Split text into normalized, filtered search tokens */
export function tokenize(text: string, config?: IndexConfig): string[] {
  const stops = config?.stopWords ? new Set(config.stopWords) : DEFAULT_STOPS;
  const min = config?.minLength ?? 2;
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= min && !stops.has(w))
    .map((word) => (config?.stemming ? stem(word) : word))
    .filter((word) => word.length >= min);
}

function docText(doc: SearchDocument): string {
  return [doc.title, doc.description ?? "", ...doc.headings, doc.content].join(
    " "
  );
}

function indexDocument(index: SearchIndex, idx: number, doc: SearchDocument) {
  const tokens = tokenize(docText(doc), index.config);
  for (const token of tokens) {
    const existing = index.terms.get(token);
    if (existing) {
      if (!existing.includes(idx)) {
        existing.push(idx);
      }
    } else {
      index.terms.set(token, [idx]);
    }
  }
}

/** Create an empty search index with optional configuration */
export function createIndex(config?: IndexConfig): SearchIndex {
  return { config, documents: [], terms: new Map(), version: 1 };
}

/** Add a document to the search index and update term mappings */
export function addDocument(index: SearchIndex, doc: SearchDocument): void {
  const idx = index.documents.length;
  index.documents.push(doc);
  indexDocument(index, idx, doc);
}

/** Remove a document from the index by path */
export function removeDocument(index: SearchIndex, path: string): void {
  const idx = index.documents.findIndex((d) => d.path === path);
  if (idx === -1) {
    return;
  }
  const doc = index.documents[idx];
  if (!doc) {
    return;
  }
  const lastIdx = index.documents.length - 1;
  const remove = (token: string, target: number) => {
    const entries = index.terms.get(token);
    if (!entries) {
      return;
    }
    const next = entries.filter((value) => value !== target);
    if (next.length === 0) {
      index.terms.delete(token);
    } else {
      index.terms.set(token, next);
    }
  };
  const replace = (token: string, from: number, to: number) => {
    const entries = index.terms.get(token);
    if (!entries) {
      return;
    }
    for (let i = 0; i < entries.length; i++) {
      if (entries[i] === from) {
        entries[i] = to;
      }
    }
  };
  for (const token of new Set(tokenize(docText(doc), index.config))) {
    remove(token, idx);
  }
  if (idx === lastIdx) {
    index.documents.pop();
    return;
  }
  const lastDoc = index.documents[lastIdx];
  if (!lastDoc) {
    index.documents.pop();
    return;
  }
  for (const token of new Set(tokenize(docText(lastDoc), index.config))) {
    replace(token, lastIdx, idx);
  }
  index.documents[idx] = lastDoc;
  index.documents.pop();
}

/** Search the index for documents matching the query */
export function search(
  index: SearchIndex,
  query: string,
  limit = 10
): SearchDocument[] {
  const tokens = tokenize(query, index.config);
  if (tokens.length === 0) {
    return [];
  }
  const scores = new Map<number, number>();
  for (const token of tokens) {
    const indices = index.terms.get(token);
    if (!indices) {
      continue;
    }
    for (const idx of indices) {
      scores.set(idx, (scores.get(idx) ?? 0) + 1);
    }
  }
  return [...scores.entries()]
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([idx]) => index.documents[idx])
    .filter((doc): doc is SearchDocument => doc !== undefined);
}

/** Serialize a search index to a JSON string for persistence */
export function serializeIndex(index: SearchIndex): string {
  return JSON.stringify({
    config: index.config,
    documents: index.documents,
    terms: [...index.terms.entries()],
    version: index.version,
  });
}

function isSearchDocument(value: unknown): value is SearchDocument {
  if (!isRecord(value)) {
    return false;
  }
  if (typeof value.path !== "string") {
    return false;
  }
  if (typeof value.title !== "string") {
    return false;
  }
  if (typeof value.content !== "string") {
    return false;
  }
  if (
    !Array.isArray(value.headings) ||
    value.headings.some((item) => typeof item !== "string")
  ) {
    return false;
  }
  if (
    value.description !== undefined &&
    typeof value.description !== "string"
  ) {
    return false;
  }
  if (
    value.tags !== undefined &&
    (!Array.isArray(value.tags) ||
      value.tags.some((item) => typeof item !== "string"))
  ) {
    return false;
  }
  return true;
}

function isTermEntry(value: unknown): value is [string, number[]] {
  if (!Array.isArray(value) || value.length !== 2) {
    return false;
  }
  if (typeof value[0] !== "string") {
    return false;
  }
  if (
    !Array.isArray(value[1]) ||
    value[1].some((item) => typeof item !== "number" || !Number.isInteger(item))
  ) {
    return false;
  }
  return true;
}

function isIndexConfig(value: unknown): value is IndexConfig {
  if (!isRecord(value)) {
    return false;
  }
  if (value.stemming !== undefined && typeof value.stemming !== "boolean") {
    return false;
  }
  if (
    value.minLength !== undefined &&
    (typeof value.minLength !== "number" || !Number.isInteger(value.minLength))
  ) {
    return false;
  }
  if (value.stopWords !== undefined) {
    if (!Array.isArray(value.stopWords)) {
      return false;
    }
    if (value.stopWords.some((item) => typeof item !== "string")) {
      return false;
    }
  }
  return true;
}

/** Deserialize a JSON string back into a validated search index */
export function deserializeIndex(data: string): SearchIndex {
  const parsed: unknown = JSON.parse(data);
  if (!isRecord(parsed)) {
    throw new Error("invalid search index");
  }
  const documents = Array.isArray(parsed.documents) ? parsed.documents : null;
  if (!documents || documents.some((item) => !isSearchDocument(item))) {
    throw new Error("invalid search index documents");
  }
  const termsRaw = Array.isArray(parsed.terms) ? parsed.terms : null;
  if (!termsRaw || termsRaw.some((item) => !isTermEntry(item))) {
    throw new Error("invalid search index terms");
  }
  const { version } = parsed;
  if (typeof version !== "number" || !Number.isInteger(version)) {
    throw new TypeError("invalid search index version");
  }
  const { config } = parsed;
  if (config !== undefined && !isIndexConfig(config)) {
    throw new Error("invalid search index config");
  }
  return {
    config,
    documents,
    terms: new Map(termsRaw),
    version,
  };
}

function stem(word: string): string {
  if (word.length <= 3) {
    return word;
  }
  if (word.endsWith("ies") && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }
  if (word.endsWith("ing") && word.length > 5) {
    return word.slice(0, -3);
  }
  if (word.endsWith("ed") && word.length > 4) {
    return word.slice(0, -2);
  }
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    return word.slice(0, -1);
  }
  return word;
}

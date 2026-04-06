/** Maximum allowed query length in characters */
export const searchMaxQuery = 200;

/** Lowercase, collapse whitespace, and truncate a search query */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .trim()
    .slice(0, searchMaxQuery);
}

/** Truncate a query to the maximum allowed length */
export function trimQuery(query: string): string {
  return query.slice(0, searchMaxQuery);
}

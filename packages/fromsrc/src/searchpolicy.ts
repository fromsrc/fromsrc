export const searchMaxQuery = 200;

export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .trim()
    .slice(0, searchMaxQuery);
}

export function trimQuery(query: string): string {
  return query.slice(0, searchMaxQuery);
}

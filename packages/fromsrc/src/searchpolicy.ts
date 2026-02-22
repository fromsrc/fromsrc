export const searchmaxquery = 200

export function normalizequery(query: string): string {
	return query.toLowerCase().replace(/\s+/g, " ").trim().slice(0, searchmaxquery)
}

export function trimquery(query: string): string {
	return query.slice(0, searchmaxquery)
}

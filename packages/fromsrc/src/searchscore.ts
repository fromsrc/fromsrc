import { typomatch } from "./searchtypo"

export interface Termindex {
	list: string[]
	set: Set<string>
}

export interface Searchtermdata {
	title: string
	slug: string
	description: string
	content: string
	titleindex: Termindex
	slugindex: Termindex
	descriptionindex: Termindex
	headingindex: Termindex
	contentindex: Termindex
}

export interface Searchweights {
	titleExact: number
	titleTypo: number
	slugExact: number
	slugTypo: number
	descriptionExact: number
	descriptionTypo: number
	headingTypo: number
	contentExact: number
}

export const defaultweights: Searchweights = {
	titleExact: 9,
	titleTypo: 5,
	slugExact: 7,
	slugTypo: 4,
	descriptionExact: 4,
	descriptionTypo: 2,
	headingTypo: 2,
	contentExact: 2,
}

export function termindex(words: string[]): Termindex {
	return { list: words, set: new Set(words) }
}

export function scoreterms(
	terms: string[],
	data: Searchtermdata,
	weights: Searchweights = defaultweights,
): number {
	let score = 0
	for (const term of terms) {
		if (data.title.includes(term) || data.titleindex.set.has(term)) {
			score += weights.titleExact
			continue
		}
		if (typomatch(term, data.titleindex.list)) {
			score += weights.titleTypo
			continue
		}
		if (data.slug.includes(term) || data.slugindex.set.has(term)) {
			score += weights.slugExact
			continue
		}
		if (typomatch(term, data.slugindex.list)) {
			score += weights.slugTypo
			continue
		}
		if (data.description.includes(term) || data.descriptionindex.set.has(term)) {
			score += weights.descriptionExact
			continue
		}
		if (typomatch(term, data.descriptionindex.list)) {
			score += weights.descriptionTypo
			continue
		}
		if (typomatch(term, data.headingindex.list)) {
			score += weights.headingTypo
			continue
		}
		if (data.contentindex.set.has(term) || data.content.includes(term)) {
			score += weights.contentExact
		}
	}
	return score
}

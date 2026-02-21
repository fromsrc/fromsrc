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

export function termindex(words: string[]): Termindex {
	return { list: words, set: new Set(words) }
}

export function scoreterms(terms: string[], data: Searchtermdata): number {
	let score = 0
	for (const term of terms) {
		if (data.title.includes(term) || data.titleindex.set.has(term)) {
			score += 9
			continue
		}
		if (typomatch(term, data.titleindex.list)) {
			score += 5
			continue
		}
		if (data.slug.includes(term) || data.slugindex.set.has(term)) {
			score += 7
			continue
		}
		if (typomatch(term, data.slugindex.list)) {
			score += 4
			continue
		}
		if (data.description.includes(term) || data.descriptionindex.set.has(term)) {
			score += 4
			continue
		}
		if (typomatch(term, data.descriptionindex.list)) {
			score += 2
			continue
		}
		if (typomatch(term, data.headingindex.list)) {
			score += 2
			continue
		}
		if (data.contentindex.set.has(term) || data.content.includes(term)) {
			score += 2
		}
	}
	return score
}

import { typoMatch } from "./searchtypo";

/** A word list and set for fast exact and fuzzy lookups */
export interface TermIndex {
  list: string[];
  set: Set<string>;
}

/** Pre-indexed document fields used for scoring search results */
export interface SearchTermData {
  title: string;
  slug: string;
  description: string;
  content: string;
  titleIndex: TermIndex;
  slugIndex: TermIndex;
  descriptionIndex: TermIndex;
  headingIndex: TermIndex;
  contentIndex: TermIndex;
}

/** Numeric weights controlling how each field contributes to search score */
export interface SearchWeights {
  titleExact: number;
  titleTypo: number;
  slugExact: number;
  slugTypo: number;
  descriptionExact: number;
  descriptionTypo: number;
  headingTypo: number;
  contentExact: number;
}

/** Default scoring weights for search fields */
export const defaultWeights: SearchWeights = {
  contentExact: 2,
  descriptionExact: 4,
  descriptionTypo: 2,
  headingTypo: 2,
  slugExact: 7,
  slugTypo: 4,
  titleExact: 9,
  titleTypo: 5,
};

export function termIndex(words: string[]): TermIndex {
  return { list: words, set: new Set(words) };
}

/** Score a set of search terms against pre-indexed document data */
export function scoreTerms(
  terms: string[],
  data: SearchTermData,
  weights: SearchWeights = defaultWeights
): number {
  let score = 0;
  for (const term of terms) {
    if (data.title.includes(term) || data.titleIndex.set.has(term)) {
      score += weights.titleExact;
      continue;
    }
    if (typoMatch(term, data.titleIndex.list)) {
      score += weights.titleTypo;
      continue;
    }
    if (data.slug.includes(term) || data.slugIndex.set.has(term)) {
      score += weights.slugExact;
      continue;
    }
    if (typoMatch(term, data.slugIndex.list)) {
      score += weights.slugTypo;
      continue;
    }
    if (
      data.description.includes(term) ||
      data.descriptionIndex.set.has(term)
    ) {
      score += weights.descriptionExact;
      continue;
    }
    if (typoMatch(term, data.descriptionIndex.list)) {
      score += weights.descriptionTypo;
      continue;
    }
    if (typoMatch(term, data.headingIndex.list)) {
      score += weights.headingTypo;
      continue;
    }
    if (data.contentIndex.set.has(term) || data.content.includes(term)) {
      score += weights.contentExact;
    }
  }
  return score;
}

export type RankableItem = {
	title: string
	description?: string
	content?: string
	tags?: string[]
	path: string
	weight?: number
}

export type RankResult = {
	item: RankableItem
	score: number
	matches: { field: string; positions: number[] }[]
}

export type RankOptions = {
	titleWeight?: number
	descriptionWeight?: number
	contentWeight?: number
	tagWeight?: number
	fuzzy?: boolean
}

function positions(text: string, q: string): number[] {
	const r: number[] = []
	const l = text.toLowerCase()
	const lq = q.toLowerCase()
	let i = l.indexOf(lq)
	while (i !== -1) { r.push(i); i = l.indexOf(lq, i + 1) }
	return r
}

function scored(text: string, q: string, w: number): number {
	const l = text.toLowerCase()
	const lq = q.toLowerCase()
	if (l === lq) return w * 3
	if (l.startsWith(lq)) return w * 2
	return l.includes(lq) ? w : 0
}

export function rank(items: RankableItem[], query: string, options?: RankOptions): RankResult[] {
	const tw = options?.titleWeight ?? 10
	const dw = options?.descriptionWeight ?? 5
	const cw = options?.contentWeight ?? 1
	const gw = options?.tagWeight ?? 8
	const results: RankResult[] = []
	for (const item of items) {
		let s = 0
		const m: RankResult["matches"] = []
		s += scored(item.title, query, tw)
		const tp = positions(item.title, query)
		if (tp.length) m.push({ field: "title", positions: tp })
		if (item.description) {
			s += scored(item.description, query, dw)
			const dp = positions(item.description, query)
			if (dp.length) m.push({ field: "description", positions: dp })
		}
		if (item.content) {
			s += scored(item.content, query, cw)
			const cp = positions(item.content, query)
			if (cp.length) m.push({ field: "content", positions: cp })
		}
		if (item.tags) {
			for (const tag of item.tags) {
				s += scored(tag, query, gw)
				const gp = positions(tag, query)
				if (gp.length) m.push({ field: "tag", positions: gp })
			}
		}
		if (item.weight) s *= item.weight
		if (s > 0) results.push({ item, score: s, matches: m })
	}
	return results.sort((a, b) => b.score - a.score)
}

export function bm25(items: RankableItem[], query: string): RankResult[] {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
	const docs = items.map((it) =>
		[it.title, it.description, it.content, ...(it.tags ?? [])].join(" ").toLowerCase().split(/\s+/),
	)
	const avgdl = docs.reduce((s, d) => s + d.length, 0) / (docs.length || 1)
	const df = new Map<string, number>()
	for (const doc of docs) for (const t of new Set(doc)) df.set(t, (df.get(t) ?? 0) + 1)
	const n = docs.length
	const results: RankResult[] = []
	for (let i = 0; i < items.length; i++) {
		const item = items[i]
		const doc = docs[i]
		if (!item || !doc) continue
		let s = 0
		const dl = doc.length
		for (const term of terms) {
			const tf = doc.filter((w) => w === term).length
			const d = df.get(term) ?? 0
			const idf = Math.log((n - d + 0.5) / (d + 0.5) + 1)
			s += idf * ((tf * 2.2) / (tf + 1.2 * (1 - 0.75 + 0.75 * (dl / avgdl))))
		}
		if (item.weight) s *= item.weight
		const mp = positions([item.title, item.content].join(" "), query)
		if (s > 0) {
			const matches = mp.length ? [{ field: "content" as const, positions: mp }] : []
			results.push({ item, score: s, matches })
		}
	}
	return results.sort((a, b) => b.score - a.score)
}

export function boostRecent(
	results: RankResult[],
	dateFn: (item: RankableItem) => Date,
	maxBoost = 1.5,
): RankResult[] {
	if (!results.length) return results
	const now = Date.now()
	const oldest = Math.min(...results.map((r) => dateFn(r.item).getTime()))
	const range = now - oldest || 1
	return results
		.map((r) => {
			const boost = 1 + (maxBoost - 1) * (1 - (now - dateFn(r.item).getTime()) / range)
			return { ...r, score: r.score * boost }
		})
		.sort((a, b) => b.score - a.score)
}

function oneedit(left: string, right: string): boolean {
	const a = left.length
	const b = right.length
	if (Math.abs(a - b) > 1) return false
	if (a === b) {
		const diffs: number[] = []
		for (let i = 0; i < a; i++) {
			if (left[i] !== right[i]) {
				diffs.push(i)
				if (diffs.length > 2) return false
			}
		}
		if (diffs.length === 1) return true
		if (diffs.length !== 2) return false
		const first = diffs[0]
		const second = diffs[1]
		if (first === undefined || second === undefined) return false
		if (second !== first + 1) return false
		return left[first] === right[second] && left[second] === right[first]
	}
	const longer = a > b ? left : right
	const shorter = a > b ? right : left
	let i = 0
	let j = 0
	let diff = 0
	while (i < longer.length && j < shorter.length) {
		if (longer[i] === shorter[j]) {
			i++
			j++
			continue
		}
		diff++
		if (diff > 1) return false
		i++
	}
	return true
}

export function typomatch(term: string, words: string[]): boolean {
	if (term.length < 3) return false
	for (const word of words) {
		if (Math.abs(word.length - term.length) > 1) continue
		if (word === term || oneedit(term, word)) return true
	}
	return false
}

export type DiffLine = {
	type: "add" | "remove" | "same"
	content: string
	oldLine?: number
	newLine?: number
}

export type DiffResult = {
	lines: DiffLine[]
	additions: number
	removals: number
	unchanged: number
}

export type DiffOptions = { context?: number; ignoreWhitespace?: boolean }

function lcs(a: string[], b: string[], ignore: boolean): number[][] {
	const table: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
	for (let i = 1; i <= a.length; i++) {
		for (let j = 1; j <= b.length; j++) {
			const ai = ignore ? a[i - 1]!.trim() : a[i - 1]!
			const bj = ignore ? b[j - 1]!.trim() : b[j - 1]!
			table[i]![j] =
				ai === bj ? table[i - 1]![j - 1]! + 1 : Math.max(table[i - 1]![j]!, table[i]![j - 1]!)
		}
	}
	return table
}

function backtrack(table: number[][], a: string[], b: string[], ignore: boolean): DiffLine[] {
	const result: DiffLine[] = []
	let i = a.length
	let j = b.length
	while (i > 0 || j > 0) {
		const ai = i > 0 ? (ignore ? a[i - 1]!.trim() : a[i - 1]!) : ""
		const bj = j > 0 ? (ignore ? b[j - 1]!.trim() : b[j - 1]!) : ""
		if (i > 0 && j > 0 && ai === bj) {
			result.push({ type: "same", content: a[i - 1]!, oldLine: i, newLine: j })
			i--
			j--
		} else if (j > 0 && (i === 0 || table[i]![j - 1]! >= table[i - 1]![j]!)) {
			result.push({ type: "add", content: b[j - 1]!, newLine: j })
			j--
		} else {
			result.push({ type: "remove", content: a[i - 1]!, oldLine: i })
			i--
		}
	}
	return result.reverse()
}

function applyContext(lines: DiffLine[], ctx: number): DiffLine[] {
	const changed = new Set<number>()
	for (let i = 0; i < lines.length; i++) {
		if (lines[i]!.type !== "same") changed.add(i)
	}
	const visible = new Set<number>()
	for (const idx of changed) {
		for (let d = -ctx; d <= ctx; d++) {
			const t = idx + d
			if (t >= 0 && t < lines.length) visible.add(t)
		}
	}
	return lines.filter((_, i) => visible.has(i))
}

export function diffLines(oldText: string, newText: string, options?: DiffOptions): DiffResult {
	const ctx = options?.context ?? 3
	const ignore = options?.ignoreWhitespace ?? false
	const a = oldText.split("\n")
	const b = newText.split("\n")
	const table = lcs(a, b, ignore)
	let lines = backtrack(table, a, b, ignore)
	if (ctx >= 0) lines = applyContext(lines, ctx)
	let additions = 0
	let removals = 0
	let unchanged = 0
	for (const line of lines) {
		if (line.type === "add") additions++
		else if (line.type === "remove") removals++
		else unchanged++
	}
	return { lines, additions, removals, unchanged }
}

export function diffFrontmatter(
	oldContent: string,
	newContent: string,
): Record<string, { old?: string; new?: string }> {
	const parse = (text: string): Record<string, string> => {
		const match = text.match(/^---\n([\s\S]*?)\n---/)
		if (!match) return {}
		const fields: Record<string, string> = {}
		for (const line of match[1]!.split("\n")) {
			const idx = line.indexOf(":")
			if (idx > 0) fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
		}
		return fields
	}
	const oldFields = parse(oldContent)
	const newFields = parse(newContent)
	const keys = new Set([...Object.keys(oldFields), ...Object.keys(newFields)])
	const result: Record<string, { old?: string; new?: string }> = {}
	for (const key of keys) {
		if (oldFields[key] !== newFields[key]) {
			result[key] = { old: oldFields[key], new: newFields[key] }
		}
	}
	return result
}

export function formatDiff(result: DiffResult): string {
	const output: string[] = []
	const { lines } = result
	const oldStart = lines.find((l) => l.oldLine)?.oldLine ?? 0
	const newStart = lines.find((l) => l.newLine)?.newLine ?? 0
	const oldCount = lines.filter((l) => l.type !== "add").length
	const newCount = lines.filter((l) => l.type !== "remove").length
	output.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`)
	for (const line of lines) {
		const prefix = line.type === "add" ? "+" : line.type === "remove" ? "-" : " "
		output.push(`${prefix}${line.content}`)
	}
	return output.join("\n")
}

export function summarizeDiff(result: DiffResult): string {
	return `+${result.additions} -${result.removals} ~${result.unchanged}`
}

import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export type CodeMeta = {
	title?: string
	filename?: string
	highlight?: number[]
	showLineNumbers?: boolean
	copy?: boolean
	[key: string]: unknown
}

function parseRange(raw: string): number[] {
	const result: number[] = []
	for (const part of raw.split(",")) {
		const trimmed = part.trim()
		if (trimmed.includes("-")) {
			const [start, end] = trimmed.split("-")
			const a = Number.parseInt(start ?? "", 10)
			const b = Number.parseInt(end ?? "", 10)
			if (!Number.isNaN(a) && !Number.isNaN(b)) {
				for (let i = a; i <= b; i++) result.push(i)
			}
		} else {
			const n = Number.parseInt(trimmed, 10)
			if (!Number.isNaN(n)) result.push(n)
		}
	}
	return result
}

function parseBrace(raw: string): unknown {
	const inner = raw.slice(1, -1)
	if (/^[\d,\s-]+$/.test(inner)) return parseRange(inner)
	try {
		return JSON.parse(raw)
	} catch {
		return inner
	}
}

export function parseMeta(meta: string): CodeMeta {
	const result: CodeMeta = {}
	const pattern = /(\w+)=("[^"]*"|'[^']*'|\{[^}]*\})|(\{[^}]*\})|(\w+)/g
	let match: RegExpExecArray | null

	while ((match = pattern.exec(meta)) !== null) {
		if (match[1] && match[2]) {
			const key = match[1]
			const val = match[2]
			if (!key || !val) continue
			if (val.startsWith('"') || val.startsWith("'")) {
				result[key] = val.slice(1, -1)
			} else {
				result[key] = parseBrace(val)
			}
		} else if (match[3]) {
			result.highlight = parseRange(match[3].slice(1, -1))
		} else if (match[4]) {
			result[match[4]] = true
		}
	}
	return result
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code) => {
		if (!node.meta) return
		const meta = parseMeta(node.meta)
		const data = (node.data ?? {}) as Code["data"] & { meta?: CodeMeta }
		data.meta = meta
		node.data = data
	})
}

export const remarkMeta: Plugin<[], Root> = () => transformer

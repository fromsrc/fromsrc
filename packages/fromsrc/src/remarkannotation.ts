import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export type Annotation = {
	line: number
	type: string
}

const patterns = [
	/\/\/\s*\[!code\s+(\w+[+-]*)\]\s*$/,
	/#\s*\[!code\s+(\w+[+-]*)\]\s*$/,
	/<!--\s*\[!code\s+(\w+[+-]*)\]\s*-->\s*$/,
]

const validTypes = new Set(["highlight", "focus", "warning", "error"])

function parseType(raw: string): string | null {
	if (raw === "++") return "added"
	if (raw === "--") return "removed"
	const lower = raw.toLowerCase()
	if (validTypes.has(lower)) return lower
	return null
}

function matchAnnotation(line: string): { type: string; cleaned: string } | null {
	for (const pattern of patterns) {
		const match = line.match(pattern)
		if (match) {
			const raw = match[1]
			if (!raw) continue
			const parsed = parseType(raw)
			if (!parsed) continue
			return {
				type: parsed,
				cleaned: line.replace(pattern, "").trimEnd(),
			}
		}
	}
	return null
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code) => {
		if (!node.value) return

		const lines = node.value.split("\n")
		const annotations: Annotation[] = []
		const cleaned: string[] = []
		const types = new Set<string>()

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			if (line === undefined) continue
			const result = matchAnnotation(line)
			if (result) {
				annotations.push({ line: i + 1, type: result.type })
				types.add(result.type)
				cleaned.push(result.cleaned)
			} else {
				cleaned.push(line)
			}
		}

		if (annotations.length === 0) return

		node.value = cleaned.join("\n")

		const data = (node.data ?? {}) as Code["data"] & {
			annotations?: Annotation[]
			hProperties?: Record<string, unknown>
		}
		data.annotations = annotations

		const hProperties = data.hProperties ?? {}
		for (const t of types) {
			hProperties[`data-line-${t}`] = true
		}
		data.hProperties = hProperties
		node.data = data
	})
}

export const remarkAnnotation: Plugin<[], Root> = () => transformer

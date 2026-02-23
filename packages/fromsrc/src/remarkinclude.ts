import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { Paragraph, Root, Text } from "mdast"
import remarkParse from "remark-parse"
import { unified } from "unified"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export interface IncludeOptions {
	basePath?: string
	maxDepth?: number
}

const pattern = /^@include\s+(.+)$/
const parser = unified().use(remarkParse)

function inside(rootDir: string, filepath: string): boolean {
	const root = resolve(rootDir)
	const full = resolve(filepath)
	const rooted = `${root}/`
	return full === root || full.startsWith(rooted)
}

function expand(tree: Root, rootDir: string, base: string, max: number, depth: number) {
	if (depth > max) return

	visit(tree, "paragraph", (node: Paragraph, index, parent) => {
		if (!parent || index === undefined) return
		if (node.children.length !== 1) return

		const child = node.children[0] as Text
		if (child?.type !== "text") return

		const match = child.value.trim().match(pattern)
		if (!match) return

		const includePath = match[1]
		if (!includePath) return
		const filepath = resolve(base, includePath)
		if (!inside(rootDir, filepath)) {
			return
		}
		let content: string

		try {
			content = readFileSync(filepath, "utf-8")
		} catch {
			return
		}

		const parsed = parser.parse(content)
		const nodes = parsed.children

		parent.children.splice(index, 1, ...(nodes as typeof parent.children))

		const subtree: Root = { type: "root", children: nodes }
		expand(subtree, rootDir, dirname(filepath), max, depth + 1)
	})
}

export const remarkInclude: Plugin<[IncludeOptions?], Root> = (options) => {
	const rootDir = resolve(options?.basePath ?? ".")
	const max = options?.maxDepth ?? 3
	return (tree) => expand(tree, rootDir, rootDir, max, 0)
}

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import type { Paragraph, Root, Text } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export interface IncludeOptions {
	baseDir?: string
	maxDepth?: number
}

const pattern = /^@include\s+(.+)$/

function expand(tree: Root, baseDir: string, maxDepth: number, depth: number) {
	if (depth > maxDepth) return

	visit(tree, "paragraph", (node: Paragraph, index, parent) => {
		if (!parent || index === undefined) return
		if (node.children.length !== 1) return

		const child = node.children[0] as Text
		if (child?.type !== "text") return

		const match = child.value.trim().match(pattern)
		if (!match) return

		const includePath = match[1]
		if (!includePath) return
		const filepath = resolve(baseDir, includePath)
		let content: string

		try {
			content = readFileSync(filepath, "utf-8")
		} catch {
			console.warn(`fromsrc: include not found: ${filepath}`)
			return
		}

		const paragraphs = content
			.split(/\n\n+/)
			.map((block) => block.trim())
			.filter(Boolean)
			.map((text) => ({
				type: "paragraph" as const,
				children: [{ type: "text" as const, value: text }],
			}))

		parent.children.splice(index, 1, ...paragraphs)

		const subtree: Root = { type: "root", children: paragraphs }
		expand(subtree, dirname(filepath), maxDepth, depth + 1)
	})
}

export const remarkInclude: Plugin<[IncludeOptions?], Root> = (options) => {
	const baseDir = options?.baseDir ?? "."
	const maxDepth = options?.maxDepth ?? 3
	return (tree) => expand(tree, baseDir, maxDepth, 0)
}

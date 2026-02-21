import type { Paragraph, Root, Text } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const blockPattern = /^\$\$([\s\S]*)\$\$$/
const inlinePattern = /\$([^$]+)\$/g
type paragraphchild = Paragraph["children"][number]
type rootchild = Root["children"][number]

function makeInline(math: string): paragraphchild {
	return {
		type: "mdxJsxTextElement" as const,
		name: "InlineMath",
		attributes: [{ type: "mdxJsxAttribute" as const, name: "math", value: math }],
		children: [],
		data: { _mdxExplicitJsx: true },
	} as unknown as paragraphchild
}

function makeBlock(math: string): rootchild {
	return {
		type: "mdxJsxFlowElement" as const,
		name: "BlockMath",
		attributes: [{ type: "mdxJsxAttribute" as const, name: "math", value: math }],
		children: [],
		data: { _mdxExplicitJsx: true },
	} as unknown as rootchild
}

function transformer(tree: Root) {
	visit(tree, "paragraph", (node: Paragraph, index, parent) => {
		if (!parent || index === undefined) return
		if (node.children.length !== 1) return
		const child = node.children[0]
		if (child?.type !== "text") return
		const match = child.value.trim().match(blockPattern)
		if (!match) return
		parent.children[index] = makeBlock(match[1]!.trim())
	})

	visit(tree, "paragraph", (node: Paragraph) => {
		const next: paragraphchild[] = []
		let changed = false

		for (const child of node.children) {
			if (child.type !== "text" || !inlinePattern.test(child.value)) {
				next.push(child)
				continue
			}

			changed = true
			inlinePattern.lastIndex = 0
			let cursor = 0
			let match: RegExpExecArray | null

			while ((match = inlinePattern.exec(child.value)) !== null) {
				if (match.index > cursor) {
					next.push({
						type: "text",
						value: child.value.slice(cursor, match.index),
					} as paragraphchild)
				}
				next.push(makeInline(match[1]!))
				cursor = match.index + match[0].length
			}

			if (cursor < child.value.length) {
				next.push({ type: "text", value: child.value.slice(cursor) } as paragraphchild)
			}
		}

		if (changed) {
			node.children = next
		}
	})
}

export const remarkMath: Plugin<[], Root> = () => transformer

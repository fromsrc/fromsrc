import type { Heading, PhrasingContent, Root, Text } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const pattern = /\s*\{#([\w-]+)\}\s*$/

function findTrailingId(children: PhrasingContent[]): { index: number; id: string } | null {
	for (let i = children.length - 1; i >= 0; i--) {
		const child = children[i]!
		if (child.type === "text") {
			const match = child.value.match(pattern)
			if (match) return { index: i, id: match[1]! }
		}
	}
	return null
}

function stripId(node: Heading, index: number) {
	const child = node.children[index]! as Text
	const stripped = child.value.replace(pattern, "")
	if (stripped) {
		node.children[index] = { ...child, value: stripped }
	} else {
		node.children.splice(index, 1)
	}
}

function transformer(tree: Root) {
	visit(tree, "heading", (node: Heading) => {
		if (node.children.length === 0) return
		const result = findTrailingId(node.children)
		if (!result) return
		const data = (node.data || {}) as any
		data.id = result.id
		data.hProperties = { ...(data.hProperties as object), id: result.id }
		node.data = data
		stripId(node, result.index)
	})
}

export const remarkHeadingId: Plugin<[], Root> = () => transformer

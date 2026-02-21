import type { Blockquote, Paragraph, Root, Text } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const types: Record<string, string> = {
	NOTE: "info",
	TIP: "tip",
	WARNING: "warning",
	CAUTION: "error",
	IMPORTANT: "info",
}

const pattern = /^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\]\s*/

function transformer(tree: Root) {
	visit(tree, "blockquote", (node: Blockquote, index, parent) => {
		if (!parent || index === undefined) return
		const first = node.children[0]
		if (first?.type !== "paragraph") return

		const text = first.children[0]
		if (text?.type !== "text") return

		const match = text.value.match(pattern)
		if (!match) return

		const calloutType = types[match[1]!]
		text.value = text.value.replace(pattern, "")

		if (!text.value && first.children.length === 1) {
			node.children.shift()
		} else if (!text.value) {
			first.children.shift()
		}

		const children = node.children.length
			? node.children
			: [{ type: "paragraph" as const, children: [{ type: "text" as const, value: "" }] }]

		parent.children[index] = {
			type: "mdxJsxFlowElement",
			name: "Callout",
			attributes: [
				{
					type: "mdxJsxAttribute",
					name: "type",
					value: calloutType,
				},
			],
			children,
			data: { _mdxExplicitJsx: true },
		} as unknown as Root["children"][number]
	})
}

export const remarkAlerts: Plugin<[], Root> = () => transformer

export default remarkAlerts

import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type mermaidelement = {
	type: "mdxJsxFlowElement"
	name: "Mermaid"
	attributes: [{ type: "mdxJsxAttribute"; name: "chart"; value: string }]
	children: []
	data: { _mdxExplicitJsx: true }
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined) return
		if (node.lang !== "mermaid") return
		const element: mermaidelement = {
			type: "mdxJsxFlowElement",
			name: "Mermaid",
			attributes: [
				{ type: "mdxJsxAttribute" as const, name: "chart", value: node.value },
			],
			children: [],
			data: { _mdxExplicitJsx: true },
		}
		parent.children[index] = element as Root["children"][number]
	})
}

export const remarkMermaid: Plugin<[], Root> = () => transformer

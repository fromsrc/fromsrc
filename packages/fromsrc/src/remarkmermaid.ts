import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined) return
		if (node.lang !== "mermaid") return
		const element = {
			type: "mdxJsxFlowElement",
			name: "Mermaid",
			attributes: [
				{ type: "mdxJsxAttribute" as const, name: "chart", value: node.value },
			],
			children: [],
			data: { _mdxExplicitJsx: true },
		}
		;(parent.children as any[])[index] = element
	})
}

export const remarkMermaid: Plugin<[], Root> = () => transformer

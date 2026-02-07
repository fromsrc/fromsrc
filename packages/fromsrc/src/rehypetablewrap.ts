import type { Element, Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export type TableWrapOptions = {
	className?: string
}

export const rehypeTableWrap: Plugin<[TableWrapOptions?], Root> = (options) => {
	const className = options?.className ?? "overflow-x-auto"

	return (tree: Root) => {
		visit(tree, "element", (node: Element, index, parent) => {
			if (node.tagName !== "table") return
			if (!parent || index === undefined) return

			const wrapper: Element = {
				type: "element",
				tagName: "div",
				properties: {
					className: [className],
					role: "region",
					tabIndex: 0,
				},
				children: [node],
			}

			parent.children[index] = wrapper
		})
	}
}

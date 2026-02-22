import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

function rehypeAnchors() {
	return (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (!["h2", "h3", "h4"].includes(node.tagName)) return
			const raw = node.properties?.id
			const id = typeof raw === "string" ? raw : undefined
			if (!id) return

			const link: Element = {
				type: "element",
				tagName: "a",
				properties: { href: `#${id}`, className: ["heading-anchor"] },
				children: [
					...node.children,
					{
						type: "element",
						tagName: "span",
						properties: { className: ["heading-anchor-icon"], ariaHidden: "true" },
						children: [{ type: "text", value: "#" }],
					},
				],
			}

			node.children = [link]
		})
	}
}

export { rehypeAnchors }
export default rehypeAnchors

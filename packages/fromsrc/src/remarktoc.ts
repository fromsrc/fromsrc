import type { Heading, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type Item = { text: string; slug: string; depth: number }
type textnode = { type: "text"; value: string }
type markernode = { type: "paragraph"; children?: { type: string; value?: string }[] }
type parentnode = { children: Root["children"] }
type mdxattribute = { type: "mdxJsxAttribute"; name: string; value: string }
type mdxelement = {
	type: "mdxJsxFlowElement"
	name: string
	attributes: mdxattribute[]
	children: []
	data: { _mdxExplicitJsx: true }
}

function textContent(node: Heading): string {
	const parts: string[] = []
	visit(node, "text", (t: textnode) => {
		parts.push(t.value)
	})
	return parts.join("")
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "")
}

function isTocMarker(node: markernode): boolean {
	if (node.type !== "paragraph") return false
	if (node.children?.length !== 1) return false
	const child = node.children[0]
	return child?.type === "text" && child.value?.trim() === "[toc]"
}

export const remarkToc: Plugin<[], Root> = () => (tree) => {
	const items: Item[] = []

	visit(tree, "heading", (node: Heading) => {
		if (node.depth < 2 || node.depth > 4) return
		const text = textContent(node)
		if (!text) return
		items.push({ text, slug: slugify(text), depth: node.depth })
	})

	visit(tree, "paragraph", (node: markernode, index, parent: parentnode | undefined) => {
		if (!parent || index === undefined) return
		if (!isTocMarker(node)) return

		const element: mdxelement = {
			type: "mdxJsxFlowElement",
			name: "TableOfContents",
			attributes: [
				{
					type: "mdxJsxAttribute",
					name: "items",
					value: JSON.stringify(items),
				},
			],
			children: [],
			data: { _mdxExplicitJsx: true },
		}

		parent.children[index] = element as unknown as Root["children"][number]
	})
}

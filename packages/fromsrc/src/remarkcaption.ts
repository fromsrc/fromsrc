import type { Image, Paragraph, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type FlowElement = {
	type: string
	name: string
	attributes: { type: string; name: string; value: string }[]
	children: unknown[]
	data?: Record<string, unknown>
}

function standalone(parent: Paragraph): Image | null {
	if (parent.children.length !== 1) return null
	const child = parent.children[0]
	if (child?.type !== "image") return null
	return child as Image
}

function figure(image: Image): FlowElement {
	const attributes: FlowElement["attributes"] = [
		{ type: "mdxJsxAttribute", name: "src", value: image.url },
		{ type: "mdxJsxAttribute", name: "alt", value: image.alt || "" },
	]
	if (image.title) {
		attributes.push({ type: "mdxJsxAttribute", name: "title", value: image.title })
	}
	return {
		type: "mdxJsxFlowElement",
		name: "figure",
		attributes: [],
		children: [
			{
				type: "mdxJsxFlowElement",
				name: "img",
				attributes,
				children: [],
			},
			{
				type: "mdxJsxFlowElement",
				name: "figcaption",
				attributes: [],
				children: [{ type: "text", value: image.alt || "" }],
			},
		],
		data: { _mdxExplicitJsx: true },
	}
}

function transformer(tree: Root) {
	visit(tree, "paragraph", (node: Paragraph, index, parent) => {
		if (!parent || index === undefined) return
		const image = standalone(node)
		if (!image?.alt) return
		;(parent.children as unknown[])[index] = figure(image)
	})
}

export const remarkCaption: Plugin<[], Root> = () => transformer

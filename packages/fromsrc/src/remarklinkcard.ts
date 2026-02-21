import type { Link, Paragraph, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type CardNode = {
	type: string
	name: "LinkCard"
	attributes: { type: "mdxJsxAttribute"; name: string; value: string }[]
	children: never[]
	data: { _mdxExplicitJsx: true }
}

function extract(node: Paragraph): { href: string; title: string } | null {
	if (node.children.length !== 1) return null
	const child = node.children[0]
	if (!child) return null
	if (child.type !== "link") return null
	const link = child as Link
	if (!link.url.startsWith("https://")) return null
	const text = link.children[0]
	if (!text || text.type !== "text") return null
	const raw = text.value
	if (!raw.startsWith("card")) return null
	const title = raw.startsWith("card:")
		? raw.slice(5).trim()
		: new URL(link.url).hostname.replace(/^www\./, "")
	return { href: link.url, title }
}

function makeNode(href: string, title: string): CardNode {
	return {
		type: "mdxJsxFlowElement",
		name: "LinkCard",
		attributes: [
			{ type: "mdxJsxAttribute", name: "href", value: href },
			{ type: "mdxJsxAttribute", name: "title", value: title },
		],
		children: [] as never[],
		data: { _mdxExplicitJsx: true },
	}
}

export const remarkLinkCard: Plugin<[], Root> = () => (tree) => {
	visit(tree, "paragraph", (node: Paragraph, index, parent) => {
		if (!parent || index === undefined) return
		const result = extract(node)
		if (!result) return
		;(parent.children as CardNode[])[index] = makeNode(result.href, result.title)
	})
}

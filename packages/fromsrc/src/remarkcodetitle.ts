import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const pattern = /title=(?:"([^"]+)"|(\S+))/
type codechild = { type: "code"; value: string; lang: string | null; meta: string | null }
type titleelement = {
	type: "mdxJsxFlowElement"
	name: "CodeBlock"
	attributes: [
		{ type: "mdxJsxAttribute"; name: "title"; value: string },
		{ type: "mdxJsxAttribute"; name: "lang"; value: string },
	]
	children: [codechild]
	data: { _mdxExplicitJsx: true }
}

function parse(meta: string): { title: string; cleaned: string } | null {
	const match = meta.match(pattern)
	if (!match) return null
	const title = match[1] || match[2]
	if (!title) return null
	const cleaned = meta.replace(pattern, "").trim()
	return { title, cleaned }
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined || !node.meta) return
		const result = parse(node.meta)
		if (!result) return
		const element: titleelement = {
			type: "mdxJsxFlowElement" as const,
			name: "CodeBlock",
			attributes: [
				{ type: "mdxJsxAttribute" as const, name: "title", value: result.title },
				{ type: "mdxJsxAttribute" as const, name: "lang", value: node.lang || "" },
			],
			children: [
				{
					type: "code" as const,
					value: node.value,
					lang: node.lang ?? null,
					meta: result.cleaned || null,
				},
			],
			data: { _mdxExplicitJsx: true },
		}
		parent.children[index] = element as Root["children"][number]
	})
}

export const remarkCodeTitle: Plugin<[], Root> = () => transformer

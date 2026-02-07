import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const pattern = /title=(?:"([^"]+)"|(\S+))/

function parse(meta: string): { title: string; cleaned: string } | null {
	const match = meta.match(pattern)
	if (!match) return null
	const title = match[1] || match[2]!
	const cleaned = meta.replace(pattern, "").trim()
	return { title, cleaned }
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined || !node.meta) return
		const result = parse(node.meta)
		if (!result) return
		const element = {
			type: "mdxJsxFlowElement" as const,
			name: "CodeBlock",
			attributes: [
				{ type: "mdxJsxAttribute" as const, name: "title", value: result.title },
				{ type: "mdxJsxAttribute" as const, name: "lang", value: node.lang || "" },
			],
			children: [
				{ type: "code" as const, value: node.value, lang: node.lang, meta: result.cleaned || null },
			],
			data: { _mdxExplicitJsx: true },
		}
		;(parent.children as any[])[index] = element
	})
}

export const remarkCodeTitle: Plugin<[], Root> = () => transformer

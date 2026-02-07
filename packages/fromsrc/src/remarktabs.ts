import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function attribute(name: string, value: string) {
	return { type: "mdxJsxAttribute", name, value }
}

function skipped(node: Code): boolean {
	return !!node.meta && (node.meta.includes("nogroup") || node.meta.includes("standalone"))
}

function transformer(tree: Root) {
	visit(tree, "code", (_node: Code, index, parent) => {
		if (!parent || index === undefined) return
		if (skipped(_node)) return

		const group: Code[] = [_node]
		let next = index + 1

		while (next < parent.children.length) {
			const sibling = parent.children[next]
			if (sibling?.type !== "code") break
			if (skipped(sibling as Code)) break
			group.push(sibling as Code)
			next++
		}

		if (group.length < 2) return

		const tabs = group.map((code) => ({
			type: "mdxJsxFlowElement",
			name: "CodeTab",
			attributes: [attribute("label", code.lang ?? "text"), attribute("value", code.lang ?? "text")],
			children: [code],
			data: { _mdxExplicitJsx: true },
		}))

		const element = {
			type: "mdxJsxFlowElement",
			name: "CodeGroup",
			attributes: [],
			children: tabs,
			data: { _mdxExplicitJsx: true },
		}

		parent.children.splice(index, group.length, element as any)
	})
}

export const remarkTabs: Plugin<[], Root> = () => transformer

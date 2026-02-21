import type { Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const pattern = /\[\[badge:([^\]:]+)(?::([^\]]+))?\]\]/g
type textnode = { value: string }
type parentnode = { children: unknown[] }
type textpart = { type: "text"; value: string }
type badgepart = {
	type: "mdxJsxTextElement"
	name: "Badge"
	attributes: [{ type: "mdxJsxAttribute"; name: "variant"; value: string }]
	children: [textpart]
	data: { _mdxExplicitJsx: true }
}
type badgechild = textpart | badgepart

export const remarkBadge: Plugin<[], Root> = () => (tree) => {
	visit(tree, "text", (node: textnode, index: number | undefined, parent: parentnode | undefined) => {
		if (!parent || index === undefined) return
		const value = node.value
		pattern.lastIndex = 0
		if (!pattern.test(value)) return
		pattern.lastIndex = 0
		const parts: badgechild[] = []
		let last = 0

		for (const match of value.matchAll(pattern)) {
			const before = value.slice(last, match.index)
			if (before) {
				parts.push({ type: "text", value: before })
			}

			const text = match[1]!
			const variant = match[2] || "default"

			parts.push({
				type: "mdxJsxTextElement",
				name: "Badge",
				attributes: [{ type: "mdxJsxAttribute", name: "variant", value: variant }],
				children: [{ type: "text", value: text }],
				data: { _mdxExplicitJsx: true },
			})

			last = match.index! + match[0].length
		}

		const after = value.slice(last)
		if (after) {
			parts.push({ type: "text", value: after })
		}

		if (parts.length > 0) {
			parent.children.splice(index, 1, ...parts)
		}
	})
}

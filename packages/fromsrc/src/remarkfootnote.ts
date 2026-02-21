import type { Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type AstNode = {
	type: string
	children?: AstNode[]
	value?: string
	name?: string
	attributes?: unknown[]
	data?: Record<string, unknown>
}

const refPattern = /\[\^([^\]]+)\]/g
const defPattern = /^\[\^([^\]]+)\]:\s*(.+)$/

const attr = (name: string, value: unknown) => ({ type: "mdxJsxAttribute", name, value })
const expr = (v: string) => ({ type: "mdxJsxAttributeValueExpression", value: v })

export const remarkFootnote: Plugin<[], Root> = () => (tree) => {
	const definitions = new Map<string, string>()
	const seen: string[] = []
	const root = tree as unknown as AstNode
	if (!root.children) return

	root.children = root.children.filter((node) => {
		if (node.type !== "paragraph") return true
		const text = node.children?.[0]
		if (text?.type !== "text" || !text.value) return true
		const match = text.value.match(defPattern)
		if (!match) return true
		definitions.set(match[1]!, match[2]!)
		return false
	})

	visit(tree, "text", (node: { value: string }, index, parent) => {
		if (!parent || index === undefined) return
		const text = node.value
		if (!refPattern.test(text)) return
		refPattern.lastIndex = 0

		const parts: AstNode[] = []
		let last = 0
		let match: RegExpExecArray | null

		while ((match = refPattern.exec(text)) !== null) {
			if (match.index > last) {
				parts.push({ type: "text", value: text.slice(last, match.index) })
			}
			const id = match[1]!
			if (!seen.includes(id)) seen.push(id)
			parts.push({
				type: "mdxJsxTextElement",
				name: "FootnoteRef",
				attributes: [attr("id", id), attr("index", expr(String(seen.indexOf(id) + 1)))],
				children: [],
				data: { _mdxExplicitJsx: true },
			})
			last = match.index + match[0].length
		}

		if (last < text.length) {
			parts.push({ type: "text", value: text.slice(last) })
		}
		;(parent.children as AstNode[]).splice(index, 1, ...parts)
	})

	const items = seen.map((id) => ({ id, text: definitions.get(id) || "" }))
	root.children.push({
		type: "mdxJsxFlowElement",
		name: "FootnoteList",
		attributes: [attr("items", JSON.stringify(items))],
		children: [],
		data: { _mdxExplicitJsx: true },
	})
}

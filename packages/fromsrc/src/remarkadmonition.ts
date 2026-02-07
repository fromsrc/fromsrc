import type { Blockquote, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type AstNode = {
	type: string
	children?: AstNode[]
	value?: string
	data?: any
	name?: string
	attributes?: any[]
}

const pattern = /^\[!(\w+)\]\s*/

const types = new Set(["note", "tip", "warning", "important", "caution"])

function extractType(node: Blockquote): string | null {
	const first = node.children[0]
	if (first?.type !== "paragraph") return null
	const text = (first as AstNode).children?.[0]
	if (text?.type !== "text" || !text.value) return null
	const match = text.value.match(pattern)
	if (!match) return null
	const kind = match[1]!.toLowerCase()
	return types.has(kind) ? kind : null
}

function stripMarker(node: Blockquote): AstNode[] {
	const children = [...node.children]
	const first = children[0]
	if (first?.type !== "paragraph") return children as AstNode[]
	const para = { ...first, children: [...(first as any).children] }
	const text = para.children[0]
	if (text?.type === "text" && text.value) {
		const stripped = text.value.replace(pattern, "")
		if (stripped) {
			para.children[0] = { ...text, value: stripped }
		} else {
			para.children.shift()
		}
	}
	if (para.children.length === 0) {
		children.shift()
	} else {
		children[0] = para
	}
	return children as AstNode[]
}

function transformer(tree: Root) {
	visit(tree, "blockquote", (node: Blockquote, index, parent) => {
		if (!parent || index === undefined) return
		const kind = extractType(node)
		if (!kind) return
		const element: AstNode = {
			type: "mdxJsxFlowElement",
			name: "Callout",
			attributes: [
				{ type: "mdxJsxAttribute" as const, name: "type", value: kind },
			],
			children: stripMarker(node),
			data: { _mdxExplicitJsx: true },
		}
		;(parent.children as AstNode[])[index] = element
	})
}

export const remarkAdmonition: Plugin<[], Root> = () => transformer

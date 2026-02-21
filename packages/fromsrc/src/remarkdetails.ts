import type { Root } from "mdast"
import type { Plugin } from "unified"

interface AstNode {
	type: string
	name?: string
	children?: AstNode[]
	value?: string
	attributes?: unknown[]
	data?: Record<string, unknown>
}

const openPattern = /^\+\+\+\s*(.+)$/
const closePattern = /^\+\+\+$/

function extractText(node: AstNode): string {
	if (node.value) return node.value
	if (node.children) return node.children.map(extractText).join("")
	return ""
}

function isOpen(node: AstNode): string | null {
	if (node.type !== "paragraph") return null
	const text = extractText(node).trim()
	const match = text.match(openPattern)
	if (!match) return null
	const title = match[1]
	return title ? title.trim() : null
}

function isClose(node: AstNode): boolean {
	if (node.type !== "paragraph") return false
	return closePattern.test(extractText(node).trim())
}

function buildElement(title: string, children: AstNode[]): AstNode {
	return {
		type: "mdxJsxFlowElement",
		name: "Details",
		attributes: [{ type: "mdxJsxAttribute", name: "title", value: title }],
		children,
		data: { _mdxExplicitJsx: true },
	}
}

function processChildren(nodes: AstNode[]): AstNode[] {
	const result: AstNode[] = []
	let i = 0

	while (i < nodes.length) {
		const node = nodes[i]
		if (!node) break
		const title = isOpen(node)

		if (!title) {
			if (node.children) node.children = processChildren(node.children)
			result.push(node)
			i++
			continue
		}

		const inner: AstNode[] = []
		i++
		while (i < nodes.length) {
			const current = nodes[i]
			if (!current || isClose(current)) break
			inner.push(current)
			i++
		}
		if (i < nodes.length) i++
		result.push(buildElement(title, processChildren(inner)))
	}

	return result
}

function transformer(tree: Root) {
	const root = tree as AstNode
	if (root.children) root.children = processChildren(root.children)
}

export const remarkDetails: Plugin<[], Root> = () => transformer

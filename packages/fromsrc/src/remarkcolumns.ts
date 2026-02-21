import type { Root } from "mdast"
import type { Plugin } from "unified"

interface AstNode {
	type: string
	name?: string
	children?: AstNode[]
	value?: string
	attributes?: AstAttr[]
	data?: Record<string, unknown>
}

type AstAttr = {
	type: "mdxJsxAttribute"
	name: string
	value?: string
}

function text(n: AstNode): string {
	return n.value ?? n.children?.map(text).join("") ?? ""
}

function para(node: AstNode, re: RegExp) {
	return node.type === "paragraph" ? text(node).trim().match(re) : null
}

const isColumnsOpen = (n: AstNode) => {
	const m = para(n, /^:::\s*columns(?:\s+(\d+))?$/)
	return m ? { count: m[1] } : null
}

const isColumnOpen = (n: AstNode) => !!para(n, /^:::\s*column$/)
const isClose = (n: AstNode) => !!para(n, /^:::$/)

function mdx(name: string, attrs: AstAttr[], children: AstNode[]): AstNode {
	return {
		type: "mdxJsxFlowElement",
		name,
		attributes: attrs,
		children,
		data: { _mdxExplicitJsx: true },
	}
}

function processChildren(nodes: AstNode[]): AstNode[] {
	const result: AstNode[] = []
	let i = 0

	while (i < nodes.length) {
		const node = nodes[i]!
		const open = isColumnsOpen(node)
		if (!open) {
			if (node.children) node.children = processChildren(node.children)
			result.push(node)
			i++
			continue
		}

		const attrs: AstAttr[] = []
		if (open.count) {
			attrs.push({ type: "mdxJsxAttribute", name: "count", value: open.count })
		}

		const columns: AstNode[] = []
		let current: AstNode[] | null = null
		i++

		while (i < nodes.length && !isClose(nodes[i]!)) {
			if (isColumnOpen(nodes[i]!)) {
				if (current) columns.push(mdx("Column", [], current))
				current = []
			} else if (current) {
				current.push(nodes[i]!)
			}
			i++
		}

		if (current) columns.push(mdx("Column", [], current))
		if (i < nodes.length) i++
		result.push(mdx("Columns", attrs, columns))
	}

	return result
}

export const remarkColumns: Plugin<[], Root> = () => (tree) => {
	const root = tree as unknown as AstNode
	if (root.children) root.children = processChildren(root.children)
}

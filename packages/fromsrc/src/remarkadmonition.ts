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

const types = new Set(["note", "tip", "info", "warning", "danger", "caution", "important"])

const openPattern = /^:::(\w+)(?:\s+(.+))?$/
const closePattern = /^:::$/

function extractText(node: AstNode): string {
	if (node.value) return node.value
	if (node.children) return node.children.map(extractText).join("")
	return ""
}

function isOpen(node: AstNode): { kind: string; title?: string } | null {
	if (node.type !== "paragraph") return null
	const text = extractText(node).trim()
	const match = text.match(openPattern)
	if (!match) return null
	const raw = match[1]
	if (!raw) return null
	const kind = raw.toLowerCase()
	if (!types.has(kind)) return null
	return { kind, title: match[2]?.trim() || undefined }
}

function isClose(node: AstNode): boolean {
	if (node.type !== "paragraph") return false
	return closePattern.test(extractText(node).trim())
}

function buildElement(kind: string, title: string | undefined, children: AstNode[]): AstNode {
	const attrs: unknown[] = [{ type: "mdxJsxAttribute", name: "type", value: kind }]
	if (title) {
		attrs.push({ type: "mdxJsxAttribute", name: "title", value: title })
	}
	return {
		type: "mdxJsxFlowElement",
		name: "Callout",
		attributes: attrs,
		children,
		data: { _mdxExplicitJsx: true },
	}
}

function processChildren(nodes: AstNode[]): AstNode[] {
	const result: AstNode[] = []
	let i = 0

	while (i < nodes.length) {
		const node = nodes[i]
		if (!node) {
			i++
			continue
		}
		const open = isOpen(node)

		if (!open) {
			if (node.children) {
				node.children = processChildren(node.children)
			}
			result.push(node)
			i++
			continue
		}

		const inner: AstNode[] = []
		i++

		while (i < nodes.length) {
			const child = nodes[i]
			if (!child || isClose(child)) break
			inner.push(child)
			i++
		}

		if (i < nodes.length) {
			i++
		}

		result.push(buildElement(open.kind, open.title, processChildren(inner)))
	}

	return result
}

function transformer(tree: Root) {
	const root = tree as AstNode
	if (root.children) {
		root.children = processChildren(root.children)
	}
}

export const remarkAdmonition: Plugin<[], Root> = () => transformer

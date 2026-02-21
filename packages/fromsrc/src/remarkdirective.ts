import type { Root } from "mdast"
import type { Plugin } from "unified"

export type DirectiveType = "note" | "tip" | "warning" | "danger" | "info" | "caution"

const directives = new Set<string>(["note", "tip", "warning", "danger", "info", "caution"])

const openPattern = /^:::(\w+)(?:\{(.+?)\})?$/
const closePattern = /^:::$/

interface AstNode {
	type: string
	name?: string
	children?: AstNode[]
	value?: string
	attributes?: unknown[]
	data?: Record<string, unknown>
}

function parseAttributes(raw: string): Record<string, string> {
	const attrs: Record<string, string> = {}
	const regex = /(\w+)="([^"]*?)"/g
	let match: RegExpExecArray | null
	while ((match = regex.exec(raw)) !== null) {
		const key = match[1]
		const value = match[2]
		if (!key || value === undefined) continue
		attrs[key] = value
	}
	return attrs
}

function extractText(node: AstNode): string {
	if (node.value) return node.value
	if (node.children) return node.children.map(extractText).join("")
	return ""
}

function isOpen(node: AstNode): { type: DirectiveType; attrs: Record<string, string> } | null {
	if (node.type !== "paragraph") return null
	const text = extractText(node).trim()
	const match = text.match(openPattern)
	if (!match) return null
	const raw = match[1]
	if (!raw) return null
	const name = raw.toLowerCase()
	if (!directives.has(name)) return null
	const attrs = match[2] ? parseAttributes(match[2]) : {}
	return { type: name as DirectiveType, attrs }
}

function isClose(node: AstNode): boolean {
	if (node.type !== "paragraph") return false
	return extractText(node).trim() === ":::"
}

function attribute(name: string, value: string) {
	return { type: "mdxJsxAttribute", name, value }
}

const defaultTitles: Record<DirectiveType, string> = {
	note: "Note",
	tip: "Tip",
	warning: "Warning",
	danger: "Danger",
	info: "Info",
	caution: "Caution",
}

function buildElement(
	type: DirectiveType,
	attrs: Record<string, string>,
	children: AstNode[],
): AstNode {
	const jsxAttrs = [attribute("type", type)]
	const title = attrs.title ?? defaultTitles[type]
	jsxAttrs.push(attribute("title", title))
	return {
		type: "mdxJsxFlowElement",
		name: "Callout",
		attributes: jsxAttrs,
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
			const current = nodes[i]
			if (!current || isClose(current)) break
			inner.push(current)
			i++
		}

		if (i < nodes.length) {
			i++
		}

		const processed = processChildren(inner)
		result.push(buildElement(open.type, open.attrs, processed))
	}

	return result
}

function transformer(tree: Root) {
	const root = tree as unknown as AstNode
	if (root.children) {
		root.children = processChildren(root.children)
	}
}

export const remarkDirective: Plugin<[], Root> = () => transformer

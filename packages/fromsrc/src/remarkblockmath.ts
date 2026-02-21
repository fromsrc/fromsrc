import type { Code, Root, Text } from "mdast"
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

const langs = new Set(["math", "latex", "katex"])
const inlinePattern = /(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/

function blockElement(value: string): AstNode {
	return {
		type: "mdxJsxFlowElement",
		name: "BlockMath",
		attributes: [{ type: "mdxJsxAttribute", name: "math", value }],
		children: [],
		data: { _mdxExplicitJsx: true },
	}
}

function inlineElement(value: string): AstNode {
	return {
		type: "mdxJsxTextElement",
		name: "InlineMath",
		attributes: [{ type: "mdxJsxAttribute", name: "math", value }],
		children: [],
		data: { _mdxExplicitJsx: true },
	}
}

function splitInline(text: string): AstNode[] {
	const nodes: AstNode[] = []
	let remaining = text
	while (remaining) {
		const match = remaining.match(inlinePattern)
		if (!match || match.index === undefined) {
			if (remaining) nodes.push({ type: "text", value: remaining })
			break
		}
		if (match.index > 0) {
			nodes.push({ type: "text", value: remaining.slice(0, match.index) })
		}
		nodes.push(inlineElement(match[1]!))
		remaining = remaining.slice(match.index + match[0].length)
	}
	return nodes
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined) return
		if (!node.lang || !langs.has(node.lang)) return
		;(parent.children as AstNode[])[index] = blockElement(node.value)
	})

	visit(tree, "text", (node: Text, index, parent) => {
		if (!parent || index === undefined) return
		if (!inlinePattern.test(node.value)) return
		const nodes = splitInline(node.value)
		if (nodes.length <= 1) return
		;(parent.children as AstNode[]).splice(index, 1, ...nodes)
	})
}

export const remarkBlockMath: Plugin<[], Root> = () => transformer

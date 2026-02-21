import type { Heading, Root } from "mdast"
import type { Node } from "unist"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export interface TocHeading {
	id: string
	text: string
	level: number
}

export interface TocNode {
	id: string
	text: string
	level: number
	children: TocNode[]
}

function extractText(node: Node): string {
	if ("value" in node && typeof node.value === "string") return node.value
	if ("children" in node && Array.isArray(node.children)) {
		return node.children.map(extractText).join("")
	}
	return ""
}

function generateId(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

export function buildTocTree(headings: TocHeading[]): TocNode[] {
	const root: TocNode[] = []
	const stack: TocNode[] = []

	for (const heading of headings) {
		const node: TocNode = {
			id: heading.id,
			text: heading.text,
			level: heading.level,
			children: [],
		}

		while (stack.length > 0 && stack[stack.length - 1]!.level >= heading.level) {
			stack.pop()
		}

		if (stack.length === 0) {
			root.push(node)
		} else {
			stack[stack.length - 1]!.children.push(node)
		}

		stack.push(node)
	}

	return root
}

type filedata = { data: Record<string, unknown> }

function transformer(tree: Root, file: filedata) {
	const headings: TocHeading[] = []

	visit(tree, "heading", (node: Heading) => {
		const text = extractText(node)
		headings.push({
			id: generateId(text),
			text,
			level: node.depth,
		})
	})

	file.data.headings = headings
	file.data.toc = buildTocTree(headings)
}

export const remarkStructure: Plugin<[], Root> = () => transformer

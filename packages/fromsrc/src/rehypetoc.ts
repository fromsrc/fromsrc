import type { Plugin } from "unified"
import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

export interface TocEntry {
	id: string
	text: string
	level: number
	children: TocEntry[]
}

export interface RehypeTocOptions {
	minLevel?: number
	maxLevel?: number
}

function extractText(node: Element): string {
	let text = ""
	for (const child of node.children) {
		if (child.type === "text") {
			text += child.value
		} else if (child.type === "element") {
			text += extractText(child)
		}
	}
	return text
}

const levelMap: Record<string, number> = {
	h1: 1,
	h2: 2,
	h3: 3,
	h4: 4,
	h5: 5,
	h6: 6,
}

function buildTree(headings: { id: string; text: string; level: number }[]): TocEntry[] {
	const root: TocEntry[] = []
	const stack: TocEntry[] = []

	for (const heading of headings) {
		const node: TocEntry = { ...heading, children: [] }

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

export const rehypeToc: Plugin<[RehypeTocOptions?], Root> = (options) => {
	const min = options?.minLevel ?? 2
	const max = options?.maxLevel ?? 4

	return (tree: Root, file: { data: Record<string, unknown> }) => {
		const headings: { id: string; text: string; level: number }[] = []

		visit(tree, "element", (node: Element) => {
			const level = levelMap[node.tagName]
			if (!level || level < min || level > max) return

			const id = (node.properties?.id as string) ?? ""
			const text = extractText(node)
			if (!id || !text) return

			headings.push({ id, text, level })
		})

		file.data["headings"] = headings
		file.data["toc"] = buildTree(headings)
	}
}

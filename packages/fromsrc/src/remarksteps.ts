import type { List, ListItem, Paragraph, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function isStepsList(node: List): boolean {
	if (!node.ordered) return false
	return node.children.every((item: ListItem) => {
		const first = item.children[0]
		if (!first || first.type !== "paragraph") return false
		return first.children[0]?.type === "strong"
	})
}

function extractTitle(strong: any): string {
	return strong.children.map((c: any) => c.value ?? "").join("")
}

function makeStep(item: ListItem) {
	const paragraph = item.children[0] as Paragraph
	const strong = paragraph.children[0]
	const title = extractTitle(strong)

	const remaining = paragraph.children.slice(1)
	const first = remaining[0]
	const trimmed =
		first && first.type === "text" && first.value.startsWith(" ")
			? [{ ...first, value: first.value.slice(1) }, ...remaining.slice(1)]
			: remaining

	const children: any[] = []

	if (trimmed.length > 0) {
		children.push({
			type: "paragraph" as const,
			children: trimmed,
		})
	}

	for (const child of item.children.slice(1)) {
		children.push(child)
	}

	return {
		type: "mdxJsxFlowElement" as const,
		name: "Step",
		attributes: [{ type: "mdxJsxAttribute" as const, name: "title", value: title }],
		children,
		data: { _mdxExplicitJsx: true },
	}
}

function transformer(tree: Root) {
	visit(tree, "list", (node: List, index, parent) => {
		if (!parent || index === undefined) return
		if (!isStepsList(node)) return

		const steps = node.children.map(makeStep)

		parent.children[index] = {
			type: "mdxJsxFlowElement",
			name: "Steps",
			attributes: [],
			children: steps,
			data: { _mdxExplicitJsx: true },
		} as any
	})
}

export const remarkSteps: Plugin<[], Root> = () => transformer

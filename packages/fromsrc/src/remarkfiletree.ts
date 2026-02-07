import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

interface TreeNode {
	name: string
	folder: boolean
	children: TreeNode[]
}

function attribute(name: string, value: string) {
	return { type: "mdxJsxAttribute" as const, name, value }
}

function parse(content: string): TreeNode[] {
	const lines = content.split("\n").filter((l) => l.trim().length > 0)
	const root: TreeNode[] = []
	const stack: { depth: number; children: TreeNode[] }[] = [{ depth: -1, children: root }]

	for (const line of lines) {
		const trimmed = line.trimStart()
		const indent = line.length - trimmed.length
		const depth = indent === 0 ? 0 : Math.floor(indent / 2)
		const folder = trimmed.endsWith("/")
		const name = folder ? trimmed.slice(0, -1) : trimmed

		const node: TreeNode = { name, folder, children: [] }

		while (stack.length > 1 && stack[stack.length - 1]!.depth >= depth) {
			stack.pop()
		}

		stack[stack.length - 1]!.children.push(node)

		if (folder) {
			stack.push({ depth, children: node.children })
		}
	}

	return root
}

function toElement(node: TreeNode): any {
	if (node.folder) {
		return {
			type: "mdxJsxFlowElement",
			name: "Folder",
			attributes: [attribute("name", node.name)],
			children: node.children.map(toElement),
			data: { _mdxExplicitJsx: true },
		}
	}
	return {
		type: "mdxJsxFlowElement",
		name: "File",
		attributes: [attribute("name", node.name)],
		children: [],
		data: { _mdxExplicitJsx: true },
	}
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined) return
		const isFiletree = node.lang === "filetree" || node.meta?.includes("filetree")
		if (!isFiletree) return

		const nodes = parse(node.value)
		const element = {
			type: "mdxJsxFlowElement" as const,
			name: "Files",
			attributes: [],
			children: nodes.map(toElement),
			data: { _mdxExplicitJsx: true },
		}

		parent.children[index] = element as any
	})
}

export const remarkFileTree: Plugin<[], Root> = () => transformer

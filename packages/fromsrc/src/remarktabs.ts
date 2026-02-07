import type { Root } from "mdast"
import type { Plugin } from "unified"

interface Node {
	type: string
	name?: string
	children?: Node[]
	attributes?: Record<string, string>
	data?: any
}

function attribute(name: string, value: string) {
	return { type: "mdxJsxAttribute", name, value }
}

function walk(nodes: Node[]) {
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i]!
		if (node.type === "containerDirective" && node.name === "tabs") {
			const tabs: any[] = []
			for (const child of node.children ?? []) {
				if (
					(child.type === "containerDirective" || child.type === "leafDirective") &&
					child.name === "tab"
				) {
					const label = child.attributes?.label ?? ""
					tabs.push({
						type: "mdxJsxFlowElement",
						name: "Tab",
						attributes: [attribute("label", label)],
						children: child.children ?? [],
						data: { _mdxExplicitJsx: true },
					})
				}
			}
			;(nodes as any)[i] = {
				type: "mdxJsxFlowElement",
				name: "Tabs",
				attributes: [],
				children: tabs,
				data: { _mdxExplicitJsx: true },
			}
		} else if (node.children) {
			walk(node.children)
		}
	}
}

function transformer(tree: Root) {
	walk((tree as unknown as Node).children ?? [])
}

export const remarkTabs: Plugin<[], Root> = () => transformer

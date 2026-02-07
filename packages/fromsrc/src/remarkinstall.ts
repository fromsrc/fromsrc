import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

const languages = new Set(["npm", "package", "install"])

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined) return
		if (!node.lang || !languages.has(node.lang)) return

		const pkg = node.value
			.split(/\s+/)
			.filter(Boolean)
			.filter((w) => !w.startsWith("npm") && w !== "install" && w !== "i" && w !== "add")
			.join(" ")

		if (!pkg) return

		const attributes: any[] = [
			{
				type: "mdxJsxAttribute",
				name: "pkg",
				value: pkg,
			},
		]

		if (node.meta?.includes("dev")) {
			attributes.push({
				type: "mdxJsxAttribute",
				name: "dev",
				value: null,
			})
		}

		parent.children[index] = {
			type: "mdxJsxFlowElement",
			name: "Install",
			attributes,
			children: [],
			data: { _mdxExplicitJsx: true },
		} as any
	})
}

export const remarkInstall: Plugin<[], Root> = () => transformer

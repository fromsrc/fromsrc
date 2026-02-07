import type { Element, Root, Text } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function extractText(node: Element): string {
	let result = ""
	for (const child of node.children) {
		if (child.type === "text") {
			result += (child as Text).value
		} else if (child.type === "element") {
			result += extractText(child as Element)
		}
	}
	return result
}

const rehypeCopy: Plugin<[], Root> = () => {
	return (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "pre") return
			const code = node.children.find(
				(child): child is Element => child.type === "element" && child.tagName === "code",
			)
			if (!code) return
			const text = extractText(code).replace(/\n$/, "").trim()
			if (!node.properties) node.properties = {}
			node.properties["data-copy"] = text
		})
	}
}

export { rehypeCopy }

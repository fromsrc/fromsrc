import type { Element, Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function extractText(node: any): string {
	if (node.type === "text") return node.value
	if (node.children) return node.children.map(extractText).join("")
	return ""
}

function transformer(tree: Root) {
	visit(tree, "element", (node: Element) => {
		if (node.tagName !== "pre") return
		const code = node.children.find(
			(c): c is Element => c.type === "element" && c.tagName === "code",
		)
		if (!code) return
		const raw = extractText(code).replace(/\n$/, "")
		node.properties ??= {}
		node.properties["data-raw"] = raw
	})
}

const rehypeRaw: Plugin<[], Root> = () => transformer

export { rehypeRaw }

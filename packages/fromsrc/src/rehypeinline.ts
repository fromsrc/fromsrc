import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"
import type { Plugin } from "unified"

export const rehypeInlineCode: Plugin<[], Root> = () => {
	return (tree: Root) => {
		visit(tree, "element", (node: Element, _index, parent) => {
			if (node.tagName !== "code") return

			if (parent && parent.type === "element" && parent.tagName === "pre") return

			const textNode = node.children[0]
			if (!textNode || textNode.type !== "text") return

			const text = textNode.value
			const match = text.match(/\{:(\w+)\}$/)
			if (!match) return

			const lang = match[1]
			const cleanText = text.slice(0, -match[0].length)

			textNode.value = cleanText

			if (!node.properties) {
				node.properties = {}
			}

			node.properties.dataLanguage = lang
			const existingClass = node.properties.className
			if (Array.isArray(existingClass)) {
				node.properties.className = [...existingClass, "inline-code-highlight"]
			} else if (typeof existingClass === "string") {
				node.properties.className = [existingClass, "inline-code-highlight"]
			} else {
				node.properties.className = ["inline-code-highlight"]
			}
		})
	}
}

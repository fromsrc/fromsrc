import type { Element, Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type textnode = { type: "text"; value: string }
type parentnode = { children?: unknown[] }

function istext(node: unknown): node is textnode {
	return typeof node === "object" && node !== null && (node as textnode).type === "text"
}

function extractText(node: unknown): string {
	if (istext(node)) return node.value
	if (typeof node === "object" && node !== null && Array.isArray((node as parentnode).children)) {
		return (node as parentnode).children?.map(extractText).join("") ?? ""
	}
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

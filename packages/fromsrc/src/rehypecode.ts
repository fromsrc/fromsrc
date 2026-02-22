import type { Element, Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function parse(meta: string): Record<string, string> {
	const attrs: Record<string, string> = {}

	let cleaned = meta

	for (const match of meta.matchAll(/(\w+)="([^"]*)"/g)) {
		const key = match[1]
		const value = match[2]
		if (!key || value === undefined) continue
		attrs[key] = value
		cleaned = cleaned.replace(match[0], "")
	}

	for (const match of meta.matchAll(/\{([^}]*)\}/g)) {
		const lines = match[1]
		if (!lines) continue
		attrs.lines = lines
		cleaned = cleaned.replace(match[0], "")
	}

	for (const match of meta.matchAll(/\/([^/]+)\//g)) {
		const word = match[1]
		if (!word) continue
		attrs.word = word
		cleaned = cleaned.replace(match[0], "")
	}

	const bare = ["showLineNumbers", "diff", "copy", "wrap"]
	for (const word of bare) {
		if (cleaned.includes(word)) {
			attrs[word] = ""
			cleaned = cleaned.replace(word, "")
		}
	}

	return attrs
}

const keymap: Record<string, string> = {
	title: "data-title",
	caption: "data-caption",
	lines: "data-lines",
	word: "data-word",
	showLineNumbers: "data-line-numbers",
	diff: "data-diff",
	copy: "data-copy",
	wrap: "data-wrap",
}

const rehypeCode: Plugin<[], Root> = () => {
	return (tree: Root) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "pre") return

			const code = node.children.find(
				(child): child is Element => child.type === "element" && child.tagName === "code",
			)
			if (!code) return

			const fromdata = code.properties?.["data-meta"]
			const frommeta = code.properties?.meta
			const meta = typeof fromdata === "string" ? fromdata : typeof frommeta === "string" ? frommeta : ""
			if (!meta) return

			const attrs = parse(meta)

			for (const [key, value] of Object.entries(attrs)) {
				const prop = keymap[key]
				if (prop) {
					node.properties ??= {}
					node.properties[prop] = value === "" ? "true" : value
				}
			}
		})
	}
}

export { rehypeCode }

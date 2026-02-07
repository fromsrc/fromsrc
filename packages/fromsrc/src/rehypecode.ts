import type { Element, Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function parse(meta: string): Record<string, string> {
	const attrs: Record<string, string> = {}

	let cleaned = meta

	for (const match of meta.matchAll(/(\w+)="([^"]*)"/g)) {
		attrs[match[1]!] = match[2]!
		cleaned = cleaned.replace(match[0], "")
	}

	for (const match of meta.matchAll(/\{([^}]*)\}/g)) {
		attrs.lines = match[1]!
		cleaned = cleaned.replace(match[0], "")
	}

	for (const match of meta.matchAll(/\/([^/]+)\//g)) {
		attrs.word = match[1]!
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

			const meta = (code.properties?.["data-meta"] ?? code.properties?.meta ?? "") as string
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

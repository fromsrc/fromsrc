import type { Plugin } from "unified"
import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"

function generateSlug(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9_-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

function extractText(node: Element): string {
	let text = ""
	for (const child of node.children) {
		if (child.type === "text") {
			text += child.value
		} else if (child.type === "element") {
			text += extractText(child)
		}
	}
	return text
}

const headings = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

const rehypeSlug: Plugin<[], Root> = () => {
	return (tree: Root) => {
		const seen = new Set<string>()

		visit(tree, "element", (node: Element) => {
			if (!headings.has(node.tagName)) return

			const raw = node.properties?.id
			const text = typeof raw === "string" && raw.length > 0 ? raw : extractText(node)
			let slug = generateSlug(text)
			if (!slug) return

			if (seen.has(slug)) {
				let counter = 1
				while (seen.has(`${slug}-${counter}`)) counter++
				slug = `${slug}-${counter}`
			}

			seen.add(slug)
			node.properties = node.properties || {}
			node.properties.id = slug
		})
	}
}

export { rehypeSlug, generateSlug }

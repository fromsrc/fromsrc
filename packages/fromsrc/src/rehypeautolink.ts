import type { Element, ElementContent, Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export type AutolinkOptions = {
	behavior?: "prepend" | "append" | "wrap"
	className?: string
	properties?: Record<string, string>
}

const headings = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

function anchor(id: string, className: string, extra: Record<string, string>): Element {
	return {
		type: "element",
		tagName: "a",
		properties: {
			href: `#${id}`,
			className,
			ariaHidden: "true",
			tabIndex: -1,
			...extra,
		},
		children: [],
	}
}

export function rehypeAutolink(options?: AutolinkOptions): Plugin<[], Root> {
	const behavior = options?.behavior ?? "prepend"
	const className = options?.className ?? "anchor"
	const extra = options?.properties ?? {}

	return () => {
		return (tree: Root) => {
			visit(tree, "element", (node: Element) => {
				if (!headings.has(node.tagName)) return

				const raw = node.properties?.id
				const id = typeof raw === "string" ? raw : undefined
				if (!id) return

				const link = anchor(id, className, extra)

				if (behavior === "wrap") {
					link.children = node.children as ElementContent[]
					node.children = [link]
				} else if (behavior === "append") {
					node.children.push(link)
				} else {
					node.children.unshift(link)
				}
			})
		}
	}
}

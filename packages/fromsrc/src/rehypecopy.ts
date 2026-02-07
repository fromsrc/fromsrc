import type { Element, Root } from "hast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

interface Options {
	className?: string
	buttonClassName?: string
}

const icon: Element = {
	type: "element",
	tagName: "svg",
	properties: {
		xmlns: "http://www.w3.org/2000/svg",
		width: 16,
		height: 16,
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 2,
		strokeLinecap: "round",
		strokeLinejoin: "round",
		ariaHidden: "true",
	},
	children: [
		{ type: "element", tagName: "path", properties: { d: "M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2z" }, children: [] },
		{ type: "element", tagName: "path", properties: { d: "M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" }, children: [] },
	],
}

const rehypeCopy: Plugin<[Options?], Root> = (options = {}) => {
	const cls = options.className ?? "group relative"
	const btnCls =
		options.buttonClassName ??
		"absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
	return (tree: Root) => {
		visit(tree, "element", (node: Element, index: number | undefined, parent) => {
			if (node.tagName !== "pre" || index === undefined || !parent) return
			const code = node.children.find(
				(child): child is Element => child.type === "element" && child.tagName === "code",
			)
			if (!code) return
			const button: Element = {
				type: "element",
				tagName: "button",
				properties: { className: btnCls, "data-copy": "", "aria-label": "copy code" },
				children: [icon],
			}
			const wrapper: Element = {
				type: "element",
				tagName: "div",
				properties: { className: cls },
				children: [node, button],
			}
			parent.children[index] = wrapper
		})
	}
}

export { rehypeCopy }

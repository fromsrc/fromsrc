import type { Image, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export interface RemarkImageOptions {
	basePath?: string
	figure?: boolean
	lazyAfter?: number
}

const dimensionPattern = /^(.+)\|(\d+)x(\d+)$/

function parseDimensions(alt: string): { alt: string; width?: number; height?: number } {
	const match = alt.match(dimensionPattern)
	if (!match) return { alt }
	const text = match[1]
	const width = match[2]
	const height = match[3]
	if (!text || !width || !height) return { alt }
	return { alt: text, width: Number(width), height: Number(height) }
}

function resolveUrl(url: string, basePath?: string): string {
	if (!basePath || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"))
		return url
	if (url.startsWith("/")) return url
	return `${basePath.replace(/\/$/, "")}/${url}`
}

function createImageProperties(
	parsed: ReturnType<typeof parseDimensions>,
	url: string,
	isLazy: boolean,
): Record<string, string | number> {
	const props: Record<string, string | number> = {
		src: url,
		alt: parsed.alt,
		loading: isLazy ? "lazy" : "eager",
		decoding: "async",
	}
	if (parsed.width) props.width = parsed.width
	if (parsed.height) props.height = parsed.height
	return props
}

type figurenode = {
	type: "mdxJsxFlowElement"
	name: "figure"
	attributes: []
	children: Array<Root["children"][number] | { type: "mdxJsxFlowElement"; name: "figcaption"; attributes: []; children: [{ type: "text"; value: string }] }>
}

function wrapInFigure(imageNode: Root["children"][number], alt: string): Root["children"][number] {
	const children: figurenode["children"] = [imageNode]
	if (alt) {
		children.push({
			type: "mdxJsxFlowElement",
			name: "figcaption",
			attributes: [],
			children: [{ type: "text", value: alt }],
		})
	}
	const figure: figurenode = {
		type: "mdxJsxFlowElement",
		name: "figure",
		attributes: [],
		children,
	}
	return figure as unknown as Root["children"][number]
}

export const remarkImage: Plugin<[RemarkImageOptions?], Root> = (options = {}) => {
	const { basePath, figure = false, lazyAfter = 0 } = options

	return (tree) => {
		let imageIndex = 0

		visit(tree, "image", (node: Image, index, parent) => {
			if (!parent || index === undefined) return
			const current = imageIndex++
			const isLazy = current > lazyAfter
			const parsed = parseDimensions(node.alt || "")
			const url = resolveUrl(node.url, basePath)

			node.alt = parsed.alt
			node.url = url
			const data = (node.data ?? {}) as Image["data"] & {
				hProperties?: Record<string, string | number>
			}
			data.hProperties = createImageProperties(parsed, url, isLazy)
			node.data = data

			if (figure) {
				parent.children[index] = wrapInFigure(node as unknown as Root["children"][number], parsed.alt)
			}
		})

		visit(tree, "html", (node: { value: string }) => {
			const imgPattern = /<img\s([^>]*)>/g
			node.value = node.value.replace(imgPattern, (match: string, attrs: string) => {
				const current = imageIndex++
				const isLazy = current > lazyAfter
				const loading = isLazy ? "lazy" : "eager"

				let result = match
				if (!attrs.includes("loading=")) {
					result = result.replace("<img ", `<img loading="${loading}" `)
				}
				if (!attrs.includes("decoding=")) {
					result = result.replace("<img ", `<img decoding="async" `)
				}
				if (basePath) {
					result = result.replace(/src="(?!https?:\/\/|\/\/)([^"]+)"/g, (_, src) => {
						return `src="${resolveUrl(src, basePath)}"`
					})
				}
				return result
			})
		})
	}
}

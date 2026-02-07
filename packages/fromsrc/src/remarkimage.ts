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
	return { alt: match[1]!, width: Number(match[2]), height: Number(match[3]) }
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

function wrapInFigure(imageNode: any, alt: string): any {
	const children: any[] = [imageNode]
	if (alt) {
		children.push({
			type: "mdxJsxFlowElement",
			name: "figcaption",
			attributes: [],
			children: [{ type: "text", value: alt }],
		})
	}
	return {
		type: "mdxJsxFlowElement",
		name: "figure",
		attributes: [],
		children,
	}
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
			;(node as any).data = {
				...(node.data || {}),
				hProperties: createImageProperties(parsed, url, isLazy),
			}

			if (figure) {
				parent.children[index] = wrapInFigure(
					{ ...node, data: { ...node.data, _mdxExplicitJsx: false } },
					parsed.alt,
				) as any
			}
		})

		visit(tree, "html", (node: any) => {
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

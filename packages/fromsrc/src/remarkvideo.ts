import type { Link, Paragraph, Root, Text } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type VideoNode = {
	type: string
	name: "Video"
	attributes: { type: "mdxJsxAttribute"; name: string; value: string }[]
	children: never[]
	data: { _mdxExplicitJsx: true }
}

type Provider = {
	pattern: RegExp
	transform: (match: RegExpMatchArray) => { src: string; type: string }
}

export type RemarkVideoOptions = { providers?: Provider[] }

const extensions = /\.(mp4|webm|mov|ogg)(\?.*)?$/

const defaults: Provider[] = [
	{
		pattern: /loom\.com\/share\/([\w-]+)/,
		transform: (m) => ({ src: `https://www.loom.com/embed/${m[1]}`, type: "loom" }),
	},
	{
		pattern: /vimeo\.com\/(\d+)/,
		transform: (m) => ({ src: `https://player.vimeo.com/video/${m[1]}`, type: "vimeo" }),
	},
]

function makeNode(src: string, type?: string): VideoNode {
	const attributes: VideoNode["attributes"] = [
		{ type: "mdxJsxAttribute", name: "src", value: src },
	]
	if (type) attributes.push({ type: "mdxJsxAttribute", name: "type", value: type })
	return {
		type: "mdxJsxFlowElement",
		name: "Video",
		attributes,
		children: [] as never[],
		data: { _mdxExplicitJsx: true },
	}
}

function resolve(url: string, providers: Provider[]): VideoNode | null {
	if (extensions.test(url)) return makeNode(url)
	for (const p of providers) {
		const match = url.match(p.pattern)
		if (!match) continue
		const { src, type } = p.transform(match)
		return makeNode(src, type)
	}
	return null
}

function extractUrl(node: Paragraph): string | null {
	if (node.children.length !== 1) return null
	const child = node.children[0]!
	if (child.type === "text") return (child as Text).value.trim()
	if (child.type === "link") return (child as Link).url
	return null
}

export const remarkVideo: Plugin<[RemarkVideoOptions?], Root> = (options = {}) => {
	const all = [...defaults, ...(options.providers ?? [])]
	return (tree) => {
		visit(tree, "paragraph", (node: Paragraph, index, parent) => {
			if (!parent || index === undefined) return
			const url = extractUrl(node)
			if (!url) return
			const video = resolve(url, all)
			if (!video) return
			;(parent.children as VideoNode[])[index] = video
		})
	}
}

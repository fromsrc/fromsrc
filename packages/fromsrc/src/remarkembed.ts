import type { Link, Paragraph, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type AstNode = {
	type: string
	children?: AstNode[]
	value?: string
	data?: any
	name?: string
	attributes?: any[]
}

type Provider = {
	pattern: RegExp
	name: string
	id: string
	extract: (url: string, match: RegExpMatchArray) => string
}

const providers: Provider[] = [
	{
		pattern: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
		name: "YouTube",
		id: "videoId",
		extract: (_, m) => m[1]!,
	},
	{
		pattern: /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
		name: "Tweet",
		id: "tweetId",
		extract: (_, m) => m[1]!,
	},
	{
		pattern: /codesandbox\.io\/s\/([\w-]+)/,
		name: "CodeSandbox",
		id: "sandboxId",
		extract: (_, m) => m[1]!,
	},
	{
		pattern: /gist\.github\.com\/[\w-]+\/([\w]+)/,
		name: "Gist",
		id: "gistId",
		extract: (_, m) => m[1]!,
	},
]

function transformer(tree: Root) {
	visit(tree, "paragraph", (node: Paragraph, index, parent) => {
		if (!parent || index === undefined) return
		if (node.children.length !== 1) return
		const child = node.children[0]!
		if (child.type !== "link") return
		const link = child as Link
		for (const provider of providers) {
			const match = link.url.match(provider.pattern)
			if (!match) continue
			const element: AstNode = {
				type: "mdxJsxFlowElement",
				name: provider.name,
				attributes: [
					{ type: "mdxJsxAttribute" as const, name: "url", value: link.url },
					{ type: "mdxJsxAttribute" as const, name: provider.id, value: provider.extract(link.url, match) },
				],
				children: [],
				data: { _mdxExplicitJsx: true },
			}
			;(parent.children as AstNode[])[index] = element
			return
		}
	})
}

export const remarkEmbed: Plugin<[], Root> = () => transformer

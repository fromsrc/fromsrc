import type { Root, Text } from "mdast"
import type { Plugin } from "unified"
import { toString } from "mdast-util-to-string"
import { visit } from "unist-util-visit"

export type ReadingTimeOptions = {
	wordsPerMinute?: number
}

export function countWords(text: string): number {
	const trimmed = text.trim()
	if (!trimmed) return 0
	return trimmed.split(/\s+/).length
}

export const remarkReadingTime: Plugin<[ReadingTimeOptions?], Root> = (options) => {
	const wpm = options?.wordsPerMinute ?? 200

	return (tree, file) => {
		let text = ""

		visit(tree, (node) => {
			if (node.type === "code" || node.type === "yaml" || (node as any).type === "toml") {
				return "skip"
			}
			if (node.type === "text" || node.type === "inlineCode") {
				text += (node as Text).value + " "
			}
		})

		const words = countWords(text)
		const minutes = Math.ceil(words / wpm)

		file.data.readingTime = {
			text: `${minutes} min read`,
			minutes,
			words,
		}
	}
}

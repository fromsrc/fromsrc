import type { Code, Heading, Paragraph, Root, Text } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export type ReadingTimeOptions = {
	wordsPerMinute?: number
	codeWordsPerMinute?: number
}

export function countWords(text: string): number {
	const trimmed = text.trim()
	if (!trimmed) return 0
	return trimmed.split(/\s+/).length
}

function collectText(node: Heading | Paragraph): string {
	let result = ""
	for (const child of node.children) {
		if (child.type === "text" || child.type === "inlineCode") {
			result += (child as Text).value + " "
		}
	}
	return result
}

export const remarkReadingTime: Plugin<[ReadingTimeOptions?], Root> = (options) => {
	const wpm = options?.wordsPerMinute ?? 200
	const codeWpm = options?.codeWordsPerMinute ?? 100

	return (tree, file) => {
		let text = ""
		let code = ""

		visit(tree, (node) => {
			if (node.type === "heading" || node.type === "paragraph") {
				text += collectText(node as Heading | Paragraph)
				return "skip"
			}
			if (node.type === "text") {
				text += (node as Text).value + " "
			}
			if (node.type === "code") {
				code += (node as Code).value + " "
				return "skip"
			}
		})

		const textWords = countWords(text)
		const codeWords = countWords(code)
		const minutes = Math.ceil(textWords / wpm + codeWords / codeWpm)

		file.data.readingTime = minutes
		file.data.wordCount = textWords + codeWords
	}
}

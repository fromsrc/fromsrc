import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

export type TwoslashAnnotation = {
	type: "query" | "completion"
	line: number
	character: number
	text?: string
}

export type TwoslashResult = {
	code: string
	annotations: TwoslashAnnotation[]
	noErrors: boolean
}

function parseannotations(code: string): TwoslashResult {
	const lines = code.split("\n")
	const output: string[] = []
	const annotations: TwoslashAnnotation[] = []
	let noErrors = false
	let offset = 0

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		if (line === undefined) continue
		const trimmed = line.trim()

		if (trimmed === "// @noErrors") {
			noErrors = true
			offset++
			continue
		}

		if (trimmed === "// @errors: next-line" || trimmed.startsWith("// @errors:")) {
			offset++
			continue
		}

		const query = line.match(/^(\s*)\/\/\s*\^(\?)(.*)$/)
		if (query) {
			const indent = query[1]
			if (indent === undefined) continue
			const col = indent.length
			const text = query[3]?.trim() || undefined
			annotations.push({
				type: "query",
				line: i - offset - 1,
				character: col,
				text,
			})
			offset++
			continue
		}

		const completion = line.match(/^(\s*)\/\/\s*\^(\|)(.*)$/)
		if (completion) {
			const indent = completion[1]
			if (indent === undefined) continue
			const col = indent.length
			const text = completion[3]?.trim() || undefined
			annotations.push({
				type: "completion",
				line: i - offset - 1,
				character: col,
				text,
			})
			offset++
			continue
		}

		output.push(line)
	}

	return { code: output.join("\n"), annotations, noErrors }
}

function serialize(annotations: TwoslashAnnotation[]): string {
	return JSON.stringify(
		annotations.map((a) => ({
			t: a.type === "query" ? "q" : "c",
			l: a.line,
			ch: a.character,
			...(a.text ? { tx: a.text } : {}),
		})),
	)
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code) => {
		if (!node.meta?.includes("twoslash")) return

		const result = parseannotations(node.value)

		if (result.annotations.length === 0) return

		node.value = result.code
		node.meta = node.meta.replace(/\btwoslash\b/, "").trim() || null

		node.data ??= {}
		const data = node.data as Record<string, unknown>
		data.hProperties ??= {}
		const props = data.hProperties as Record<string, string>
		props["data-twoslash"] = ""
		props["data-twoslash-annotations"] = serialize(result.annotations)

		if (result.noErrors) {
			props["data-twoslash-noerrors"] = ""
		}
	})
}

export { parseannotations, serialize }

export const remarkTwoslash: Plugin<[], Root> = () => transformer

import type { Root, Code } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

type codegroup = Root["children"][number]

function stripTypes(code: string): string {
	let result = code

	result = result.replace(/import\s+type\s+.*?from\s+['"].*?['"]/g, "")
	result = result.replace(/import\s+\{([^}]*)\}\s+from/g, (match, imports) => {
		const cleaned = imports
			.split(",")
			.map((imp: string) => imp.trim())
			.filter((imp: string) => !imp.startsWith("type "))
			.map((imp: string) => imp.replace(/^type\s+/, ""))
			.join(", ")
		return cleaned ? `import { ${cleaned} } from` : ""
	})

	result = result.replace(/\binterface\s+\w+\s*\{[^}]*\}/g, "")
	result = result.replace(/\btype\s+\w+\s*=\s*[^;\n]+[;\n]/g, "")
	result = result.replace(/\btype\s+\w+\s*<[^>]+>\s*=\s*[^;\n]+[;\n]/g, "")

	result = result.replace(/<[^>]+>/g, "")

	result = result.replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(?=\s*[,;=)\]}])/g, "")
	result = result.replace(/:\s*\{[^}]*\}/g, "")
	result = result.replace(/:\s*\([^)]*\)\s*=>/g, "")

	result = result.replace(/\bas\s+\w+/g, "")
	result = result.replace(/!/g, "")

	result = result.replace(/\breadonly\s+/g, "")

	result = result.replace(/\.tsx?\b/g, (match) => {
		return match === ".tsx" ? ".jsx" : ".js"
	})

	result = result.replace(/\n\s*\n\s*\n+/g, "\n\n")

	return result.trim()
}

function createCodeGroup(tsCode: string, jsCode: string, lang: string): codegroup {
	const jsLang = lang === "tsx" ? "jsx" : "javascript"

	return {
		type: "mdxJsxFlowElement",
		name: "CodeGroup",
		attributes: [],
		children: [
			{
				type: "mdxJsxFlowElement",
				name: "CodeTab",
				attributes: [
					{
						type: "mdxJsxAttribute",
						name: "label",
						value: "TypeScript",
					},
				],
				children: [
					{
						type: "code",
						lang,
						meta: null,
						value: tsCode,
					},
				],
			},
			{
				type: "mdxJsxFlowElement",
				name: "CodeTab",
				attributes: [
					{
						type: "mdxJsxAttribute",
						name: "label",
						value: "JavaScript",
					},
				],
				children: [
					{
						type: "code",
						lang: jsLang,
						meta: null,
						value: jsCode,
					},
				],
			},
		],
	} as codegroup
}

export const remarkTs2Js: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, "code", (node: Code, index, parent) => {
			if (!parent || index === null || index === undefined || typeof index !== "number") return

			const lang = node.lang
			if (!lang || !["typescript", "ts", "tsx"].includes(lang)) return

			if (node.meta?.includes("no-js")) return

			const jsCode = stripTypes(node.value)

			const codeGroup = createCodeGroup(node.value, jsCode, lang)

			parent.children[index] = codeGroup
		})
	}
}

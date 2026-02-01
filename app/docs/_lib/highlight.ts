import { createHighlighter, type Highlighter } from "shiki"

let highlighter: Highlighter | null = null

export async function getHighlighter() {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ["github-dark"],
			langs: [
				"javascript",
				"typescript",
				"tsx",
				"jsx",
				"json",
				"bash",
				"shell",
				"css",
				"html",
				"markdown",
				"mdx",
				"yaml",
				"python",
				"go",
				"rust",
			],
		})
	}
	return highlighter
}

export async function highlight(code: string, lang: string = "text") {
	const h = await getHighlighter()
	const validLang = h.getLoadedLanguages().includes(lang as any) ? lang : "text"

	return h.codeToHtml(code, {
		lang: validLang,
		theme: "github-dark",
	})
}

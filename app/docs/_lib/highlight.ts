import { type BundledLanguage, createHighlighter, type Highlighter } from "shiki"

const supportedLangs: BundledLanguage[] = [
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
]

let highlighter: Highlighter | null = null

export async function getHighlighter(): Promise<Highlighter> {
	if (!highlighter) {
		highlighter = await createHighlighter({
			themes: ["github-dark"],
			langs: supportedLangs,
		})
	}
	return highlighter
}

export async function highlight(code: string, lang: string = "text"): Promise<string> {
	const h = await getHighlighter()
	const loaded = h.getLoadedLanguages()
	const validLang = loaded.includes(lang as BundledLanguage) ? (lang as BundledLanguage) : "text"

	return h.codeToHtml(code, {
		lang: validLang,
		theme: "github-dark",
	})
}

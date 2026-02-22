import type { Doc, DocMeta } from "./content"

export interface LlmsConfig {
	title: string
	description: string
	baseUrl: string
	docsPath?: string
}

function clean(path: string): string {
	if (!path.startsWith("/")) return `/${path}`
	return path
}

function formatEntry(baseUrl: string, docsPath: string, doc: DocMeta): string {
	const path = doc.slug ? `${docsPath}/${doc.slug}` : docsPath
	const url = `${baseUrl}${path}`
	const desc = doc.description ? `: ${escapeMarkdown(doc.description)}` : ""
	return `- [${escapeMarkdown(doc.title)}](${url})${desc}`
}

export function generateLlmsIndex(config: LlmsConfig, docs: DocMeta[]): string {
	const docsPath = clean(config.docsPath ?? "/docs")
	const lines = [`# ${config.title}`, "", config.description, "", "## pages", ""]
	for (const doc of docs) {
		lines.push(formatEntry(config.baseUrl, docsPath, doc))
	}
	return lines.join("\n")
}

export function generateLlmsFull(config: LlmsConfig, docs: Doc[]): string {
	const docsPath = clean(config.docsPath ?? "/docs")
	const lines = [`# ${config.title}`, "", config.description, "", "## pages", ""]
	for (const doc of docs) {
		lines.push(formatEntry(config.baseUrl, docsPath, doc))
	}
	lines.push("", "## content")
	for (const doc of docs) {
		lines.push("", `### ${escapeMarkdown(doc.title)}`)
		if (doc.description) {
			lines.push("", escapeMarkdown(doc.description))
		}
		lines.push("", doc.content.trim())
	}
	return lines.join("\n")
}

function escapeMarkdown(text: string): string {
	return text.replace(/[[\]()\\]/g, "\\$&")
}

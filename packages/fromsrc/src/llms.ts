import type { Doc, DocMeta } from "./content"

export interface LlmsConfig {
	title: string
	description: string
	baseUrl: string
}

function formatEntry(baseUrl: string, doc: DocMeta): string {
	const url = `${baseUrl}/docs/${doc.slug}`
	const desc = doc.description ? `: ${escapeMarkdown(doc.description)}` : ""
	return `- [${escapeMarkdown(doc.title)}](${url})${desc}`
}

export function generateLlmsIndex(config: LlmsConfig, docs: DocMeta[]): string {
	const lines = [`# ${config.title}`, "", config.description, "", "## pages", ""]
	for (const doc of docs) {
		lines.push(formatEntry(config.baseUrl, doc))
	}
	return lines.join("\n")
}

export function generateLlmsFull(config: LlmsConfig, docs: Doc[]): string {
	const lines = [`# ${config.title}`, "", config.description, "", "## pages", ""]
	for (const doc of docs) {
		lines.push(formatEntry(config.baseUrl, doc))
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

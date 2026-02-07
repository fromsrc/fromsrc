import type { Doc } from "./content"
import { extractHeadings } from "./content"

export interface DocManifest {
	version: number
	generated: string
	pages: ManifestPage[]
}

export interface ManifestPage {
	slug: string
	title: string
	description?: string
	headings: { depth: number; text: string; id: string }[]
	wordCount: number
}

function countWords(content: string): number {
	return content
		.replace(/```[\s\S]*?```/g, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter((w) => w.length > 0).length
}

function toManifestPage(doc: Doc): ManifestPage {
	const headings = extractHeadings(doc.content).map((h) => ({
		depth: h.level,
		text: h.text,
		id: h.id,
	}))

	return {
		slug: doc.slug,
		title: doc.title,
		description: doc.description,
		headings,
		wordCount: countWords(doc.content),
	}
}

export function generateManifest(docs: Doc[]): DocManifest {
	return {
		version: 1,
		generated: new Date().toISOString(),
		pages: docs.map(toManifestPage),
	}
}

export function generateManifestJson(docs: Doc[]): string {
	return JSON.stringify(generateManifest(docs), null, 2)
}

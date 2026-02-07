import { readdir, readFile, stat } from "node:fs/promises"
import { extname, join, relative } from "node:path"

export type DocsStats = {
	totalPages: number
	totalWords: number
	avgWords: number
	totalHeadings: number
	totalLinks: number
	totalCodeBlocks: number
	totalImages: number
	languages: Record<string, number>
	lastUpdated: string
}

export type PageStats = {
	path: string
	words: number
	headings: number
	links: number
	codeBlocks: number
	images: number
}

export function analyzePage(content: string, path: string): PageStats {
	const words = content.split(/\s+/).filter(Boolean).length
	const headings = (content.match(/^#{1,6}\s/gm) || []).length
	const links = (content.match(/\[([^\]]*)\]\(([^)]*)\)/g) || []).length
	const images = (content.match(/!\[([^\]]*)\]\(([^)]*)\)/g) || []).length
	const codeBlocks = Math.floor((content.match(/^```/gm) || []).length / 2)
	return { path, words, headings, links, codeBlocks, images }
}

function extractLanguages(content: string): Record<string, number> {
	const langs: Record<string, number> = {}
	for (const m of content.match(/^```(\w+)/gm) || []) {
		const l = m.slice(3)
		langs[l] = (langs[l] || 0) + 1
	}
	return langs
}

async function collectFiles(dir: string): Promise<string[]> {
	const files: string[] = []
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) files.push(...(await collectFiles(full)))
		else if ([".md", ".mdx"].includes(extname(entry.name))) files.push(full)
	}
	return files
}

export async function analyzeDocs(dir: string): Promise<DocsStats> {
	const files = await collectFiles(dir)
	const pages: PageStats[] = []
	const languages: Record<string, number> = {}
	let latest = ""
	for (const file of files) {
		const content = await readFile(file, "utf-8")
		const modified = (await stat(file)).mtime.toISOString()
		if (modified > latest) latest = modified
		pages.push(analyzePage(content, relative(dir, file)))
		for (const [lang, count] of Object.entries(extractLanguages(content)))
			languages[lang] = (languages[lang] || 0) + count
	}
	const totalWords = pages.reduce((s, p) => s + p.words, 0)
	const sum = (fn: (p: PageStats) => number) => pages.reduce((s, p) => s + fn(p), 0)
	return {
		totalPages: pages.length,
		totalWords,
		avgWords: pages.length ? Math.round(totalWords / pages.length) : 0,
		totalHeadings: sum((p) => p.headings),
		totalLinks: sum((p) => p.links),
		totalCodeBlocks: sum((p) => p.codeBlocks),
		totalImages: sum((p) => p.images),
		languages,
		lastUpdated: latest || new Date().toISOString(),
	}
}

export function formatStats(stats: DocsStats): string {
	const langs = Object.entries(stats.languages)
		.sort((a, b) => b[1] - a[1])
		.map(([l, c]) => `${l}: ${c}`)
		.join(", ")
	return [
		`pages: ${stats.totalPages}`,
		`words: ${stats.totalWords} (avg ${stats.avgWords}/page)`,
		`headings: ${stats.totalHeadings}`,
		`links: ${stats.totalLinks}`,
		`code blocks: ${stats.totalCodeBlocks}`,
		`images: ${stats.totalImages}`,
		langs ? `languages: ${langs}` : null,
		`updated: ${stats.lastUpdated}`,
	].filter(Boolean).join("\n")
}

export function compareStats(before: DocsStats, after: DocsStats): string {
	const d = (l: string, a: number, b: number) =>
		b - a === 0 ? null : `${l}: ${b - a > 0 ? "+" : ""}${b - a}`
	return [
		d("pages", before.totalPages, after.totalPages),
		d("words", before.totalWords, after.totalWords),
		d("headings", before.totalHeadings, after.totalHeadings),
		d("links", before.totalLinks, after.totalLinks),
		d("code blocks", before.totalCodeBlocks, after.totalCodeBlocks),
		d("images", before.totalImages, after.totalImages),
	].filter(Boolean).join("\n")
}

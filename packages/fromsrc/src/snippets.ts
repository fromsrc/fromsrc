import { readdir, readFile } from "node:fs/promises"
import { extname, join, relative } from "node:path"

export interface SnippetConfig {
	dirs: string[]
	extensions?: string[]
}

export interface Snippet {
	id: string
	file: string
	code: string
	lang: string
	startLine: number
	endLine: number
}

const defaults = [".ts", ".tsx", ".js", ".jsx"]

const languages: Record<string, string> = {
	".ts": "typescript", ".tsx": "typescript", ".js": "javascript", ".jsx": "javascript",
	".py": "python", ".go": "go", ".rs": "rust", ".css": "css",
	".html": "html", ".json": "json", ".yaml": "yaml", ".yml": "yaml", ".sh": "bash",
}

const regionRe = /(?:\/\/|\/\*|#|\{\/\*)\s*#region\s+(\S+)(?:\s*\*\/|\s*\*\/\})?/
const endRe = /(?:\/\/|\/\*|#|\{\/\*)\s*#endregion\s+(\S+)(?:\s*\*\/|\s*\*\/\})?/

async function collect(dir: string, exts: string[]): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true })
	const nested = await Promise.all(
		entries.map((e) => {
			const full = join(dir, e.name)
			if (e.isDirectory()) return collect(full, exts)
			return exts.includes(extname(e.name)) ? [full] : []
		}),
	)
	return nested.flat()
}

function parse(content: string, filepath: string): Snippet[] {
	const lines = content.split("\n")
	const lang = languages[extname(filepath)] ?? "text"
	const open = new Map<string, number>()
	const results: Snippet[] = []
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		if (!line) continue
		const start = line.match(regionRe)
		const startId = start?.[1]
		if (startId) { open.set(startId, i); continue }
		const end = line.match(endRe)
		const endId = end?.[1]
		if (endId && open.has(endId)) {
			const s = open.get(endId)
			if (s === undefined) continue
			open.delete(endId)
			results.push({
				id: `${relative(process.cwd(), filepath)}:${endId}`,
				file: filepath, code: lines.slice(s + 1, i).join("\n"),
				lang, startLine: s + 2, endLine: i,
			})
		}
	}
	return results
}

export async function extractSnippets(config: SnippetConfig): Promise<Snippet[]> {
	const exts = config.extensions ?? defaults
	const snippets: Snippet[] = []
	for (const dir of config.dirs) {
		const files = await collect(dir, exts)
		for (const file of files) {
			snippets.push(...parse(await readFile(file, "utf-8"), file))
		}
	}
	return snippets
}

export function getSnippet(snippets: Snippet[], id: string): Snippet | null {
	return snippets.find((s) => s.id === id || s.id.endsWith(`:${id}`)) ?? null
}

export function generateSnippetMap(snippets: Snippet[]): Record<string, string> {
	const map: Record<string, string> = {}
	for (const s of snippets) map[s.id] = s.code
	return map
}

export async function extractFileSnippet(
	filepath: string,
	startLine: number,
	endLine: number,
): Promise<string> {
	const lines = (await readFile(filepath, "utf-8")).split("\n")
	return lines.slice(startLine - 1, endLine).join("\n")
}

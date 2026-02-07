import { readFile, readdir, stat } from "node:fs/promises"
import { join, relative } from "node:path"

export type ContentHash = { path: string; hash: string; size: number }
export type HashManifest = { generated: string; hashes: ContentHash[] }
export type Changes = { added: string[]; modified: string[]; removed: string[] }

function fnv1a(input: string): string {
	let h = 0x811c9dc5
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i)
		h = Math.imul(h, 0x01000193)
	}
	return (h >>> 0).toString(16).padStart(8, "0")
}

export function hashContent(content: string): string {
	return fnv1a(content)
}

export async function hashFile(filepath: string): Promise<ContentHash> {
	const [content, info] = await Promise.all([readFile(filepath, "utf-8"), stat(filepath)])
	return { path: filepath, hash: fnv1a(content), size: info.size }
}

async function collectFiles(dir: string): Promise<string[]> {
	const results: string[] = []
	const entries = await readdir(dir, { withFileTypes: true })
	for (const entry of entries) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) {
			results.push(...(await collectFiles(full)))
		} else if (/\.mdx?$/.test(entry.name)) {
			results.push(full)
		}
	}
	return results
}

export async function generateHashManifest(dir: string): Promise<HashManifest> {
	const files = await collectFiles(dir)
	const hashes = await Promise.all(
		files.map(async (f) => {
			const h = await hashFile(f)
			return { ...h, path: relative(dir, f) }
		}),
	)
	return { generated: new Date().toISOString(), hashes }
}

export function detectChanges(previous: HashManifest, current: HashManifest): Changes {
	const prev = new Map(previous.hashes.map((h) => [h.path, h.hash]))
	const curr = new Map(current.hashes.map((h) => [h.path, h.hash]))
	const added: string[] = []
	const modified: string[] = []
	const removed: string[] = []
	for (const [path, hash] of curr) {
		if (!prev.has(path)) added.push(path)
		else if (prev.get(path) !== hash) modified.push(path)
	}
	for (const path of prev.keys()) {
		if (!curr.has(path)) removed.push(path)
	}
	return { added, modified, removed }
}

export function hashFrontmatter(content: string): string | null {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	if (!match) return null
	return fnv1a(match[1]!)
}

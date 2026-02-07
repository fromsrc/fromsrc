import { readFile, readdir, writeFile } from "node:fs/promises"
import { extname, join } from "node:path"

export type BatchConfig = {
	concurrency?: number
	onProgress?: (done: number, total: number) => void
}

export type BatchResult<T> = { results: T[]; errors: BatchError[]; duration: number }

export type BatchError = { index: number; error: string }

async function collect(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { recursive: true, withFileTypes: true })
	return entries
		.filter((e) => e.isFile() && [".md", ".mdx"].includes(extname(e.name)))
		.map((e) => join(e.parentPath ?? e.path, e.name))
}

export async function batch<T>(
	items: unknown[],
	fn: (item: any, index: number) => Promise<T>,
	config?: BatchConfig,
): Promise<BatchResult<T>> {
	const limit = config?.concurrency ?? 4
	const start = performance.now()
	const results: T[] = new Array(items.length)
	const errors: BatchError[] = []
	let cursor = 0
	let done = 0

	async function next(): Promise<void> {
		while (cursor < items.length) {
			const i = cursor++
			try {
				results[i] = await fn(items[i], i)
			} catch (e) {
				errors.push({ index: i, error: e instanceof Error ? e.message : String(e) })
			}
			done++
			config?.onProgress?.(done, items.length)
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()))
	return { results, errors, duration: performance.now() - start }
}

export async function batchFiles<T>(
	dir: string,
	fn: (path: string, content: string) => Promise<T>,
	config?: BatchConfig,
): Promise<BatchResult<T>> {
	const paths = await collect(dir)
	return batch(
		paths,
		async (p: string) => {
			const content = await readFile(p, "utf-8")
			return fn(p, content)
		},
		config,
	)
}

export async function mapFiles(
	dir: string,
	transform: (content: string, path: string) => string,
	config?: BatchConfig,
): Promise<{ modified: number; total: number }> {
	const paths = await collect(dir)
	let modified = 0
	await batch(
		paths,
		async (p: string) => {
			const original = await readFile(p, "utf-8")
			const result = transform(original, p)
			if (result !== original) {
				await writeFile(p, result, "utf-8")
				modified++
			}
		},
		config,
	)
	return { modified, total: paths.length }
}

export async function forEachDoc(
	dir: string,
	fn: (path: string, content: string) => Promise<void> | void,
): Promise<void> {
	const paths = await collect(dir)
	for (const p of paths) {
		const content = await readFile(p, "utf-8")
		await fn(p, content)
	}
}

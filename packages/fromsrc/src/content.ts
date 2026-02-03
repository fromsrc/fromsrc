import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import { baseSchema } from "./schema"

export interface DocMeta {
	slug: string
	title: string
	description?: string
	order?: number
}

export interface SearchDoc extends DocMeta {
	content: string
}

export interface Doc<T extends Record<string, unknown> = Record<string, unknown>> extends DocMeta {
	content: string
	data: T
}

type SchemaType = z.ZodObject<z.ZodRawShape>

export interface ContentConfig<T extends SchemaType = typeof baseSchema> {
	dir: string
	schema?: T
}

const fileCache = new Map<string, string>()
const metaCache = new Map<string, DocMeta[]>()

async function readCached(filepath: string): Promise<string> {
	const cached = fileCache.get(filepath)
	if (cached) return cached
	const content = await readFile(filepath, "utf-8")
	fileCache.set(filepath, content)
	return content
}

export function defineContent<T extends SchemaType>(config: ContentConfig<T>) {
	const schema = config.schema ?? baseSchema

	type Meta = z.infer<T> & { slug: string }
	type Document = Meta & { content: string; data: z.infer<T> }

	let docsCache: Meta[] | null = null
	let navCache: { title: string; items: Meta[] }[] | null = null

	async function getDoc(slug: string[]): Promise<Document | null> {
		const path = slug.length === 0 ? "index" : slug.join("/")
		const filepath = join(config.dir, `${path}.mdx`)
		const indexPath = join(config.dir, `${path}/index.mdx`)

		let source: string
		let actualPath = path

		try {
			source = await readCached(filepath)
		} catch {
			try {
				source = await readCached(indexPath)
				actualPath = `${path}/index`
			} catch {
				return null
			}
		}

		try {
			const { data, content } = matter(source)
			const parsed = schema.parse(data) as z.infer<T>

			return {
				slug: actualPath,
				...parsed,
				content,
				data: parsed,
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				console.error(`Schema validation failed for ${filepath}:`)
				console.error(error.errors)
				throw error
			}
			return null
		}
	}

	async function getAllDocs(): Promise<Meta[]> {
		if (docsCache) return docsCache

		const docs: Meta[] = []

		async function scan(dir: string, prefix = "") {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				if (entry.isDirectory()) {
					await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
				} else if (entry.name.endsWith(".mdx")) {
					const filepath = join(dir, entry.name)
					const source = await readCached(filepath)
					const { data } = matter(source)
					const parsed = schema.parse(data) as z.infer<T>
					const slug = `${prefix}${entry.name.replace(".mdx", "")}`

					docs.push({
						slug: slug === "index" ? "" : slug,
						...parsed,
					})
				}
			}
		}

		try {
			await scan(config.dir)
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw error
			}
			return []
		}

		docsCache = docs.sort((a, b) => ((a.order as number) ?? 99) - ((b.order as number) ?? 99))
		return docsCache
	}

	async function getNavigation() {
		if (navCache) return navCache

		const docs = await getAllDocs()

		const sections: { title: string; items: Meta[] }[] = [
			{ title: "introduction", items: [] },
			{ title: "components", items: [] },
			{ title: "api", items: [] },
			{ title: "examples", items: [] },
		]

		for (const doc of docs) {
			if (doc.slug.startsWith("components/")) {
				sections[1].items.push(doc)
			} else if (doc.slug.startsWith("api/")) {
				sections[2].items.push(doc)
			} else if (doc.slug.startsWith("examples/")) {
				sections[3].items.push(doc)
			} else {
				sections[0].items.push(doc)
			}
		}

		navCache = sections.filter((s) => s.items.length > 0)
		return navCache
	}

	let searchCache: (Meta & { content: string })[] | null = null

	async function getSearchDocs(): Promise<(Meta & { content: string })[]> {
		if (searchCache) return searchCache

		const docs: (Meta & { content: string })[] = []

		async function scan(dir: string, prefix = "") {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				if (entry.isDirectory()) {
					await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
				} else if (entry.name.endsWith(".mdx")) {
					const filepath = join(dir, entry.name)
					const source = await readCached(filepath)
					const { data, content } = matter(source)
					const parsed = schema.parse(data) as z.infer<T>
					const slug = `${prefix}${entry.name.replace(".mdx", "")}`

					docs.push({
						slug: slug === "index" ? "" : slug,
						...parsed,
						content: stripMdx(content),
					})
				}
			}
		}

		try {
			await scan(config.dir)
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw error
			}
			return []
		}

		searchCache = docs.sort((a, b) => ((a.order as number) ?? 99) - ((b.order as number) ?? 99))
		return searchCache
	}

	return {
		getDoc,
		getAllDocs,
		getNavigation,
		getSearchDocs,
		schema,
	}
}

function stripMdx(content: string): string {
	return content
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`[^`]+`/g, "")
		.replace(/import\s+.*?from\s+['"][^'"]+['"];?/g, "")
		.replace(/export\s+.*?;/g, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/#{1,6}\s+/g, "")
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/\n+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

export async function getDoc(docsDir: string, slug: string[]): Promise<Doc | null> {
	const path = slug.length === 0 ? "index" : slug.join("/")
	const filepath = join(docsDir, `${path}.mdx`)
	const indexPath = join(docsDir, `${path}/index.mdx`)

	let source: string
	let actualPath = path

	try {
		source = await readCached(filepath)
	} catch {
		try {
			source = await readCached(indexPath)
			actualPath = `${path}/index`
		} catch {
			return null
		}
	}

	try {
		const { data, content } = matter(source)
		const parsed = baseSchema.parse(data)

		return {
			slug: actualPath,
			title: parsed.title,
			description: parsed.description,
			order: parsed.order,
			content,
			data: parsed,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error(`Schema validation failed for ${filepath}:`)
			console.error(error.errors)
			throw error
		}
		return null
	}
}

export async function getAllDocs(docsDir: string): Promise<DocMeta[]> {
	const cacheKey = docsDir
	const cached = metaCache.get(cacheKey)
	if (cached) return cached

	const docs: DocMeta[] = []

	async function scan(dir: string, prefix = "") {
		const entries = await readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			if (entry.isDirectory()) {
				await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				const filepath = join(dir, entry.name)
				const source = await readCached(filepath)
				const { data } = matter(source)
				const parsed = baseSchema.parse(data)
				const slug = `${prefix}${entry.name.replace(".mdx", "")}`

				docs.push({
					slug: slug === "index" ? "" : slug,
					title: parsed.title,
					description: parsed.description,
					order: parsed.order,
				})
			}
		}
	}

	try {
		await scan(docsDir)
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw error
		}
		return []
	}

	const sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
	metaCache.set(cacheKey, sorted)
	return sorted
}

export async function getNavigation(docsDir: string) {
	const docs = await getAllDocs(docsDir)

	const sections: { title: string; items: DocMeta[] }[] = [
		{ title: "introduction", items: [] },
		{ title: "components", items: [] },
		{ title: "api", items: [] },
		{ title: "examples", items: [] },
	]

	for (const doc of docs) {
		if (doc.slug.startsWith("components/")) {
			sections[1].items.push(doc)
		} else if (doc.slug.startsWith("api/")) {
			sections[2].items.push(doc)
		} else if (doc.slug.startsWith("examples/")) {
			sections[3].items.push(doc)
		} else {
			sections[0].items.push(doc)
		}
	}

	return sections.filter((s) => s.items.length > 0)
}

const searchCache = new Map<string, SearchDoc[]>()

export async function getSearchDocs(docsDir: string): Promise<SearchDoc[]> {
	const cacheKey = docsDir
	const cached = searchCache.get(cacheKey)
	if (cached) return cached

	const docs: SearchDoc[] = []

	async function scan(dir: string, prefix = "") {
		const entries = await readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			if (entry.isDirectory()) {
				await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				const filepath = join(dir, entry.name)
				const source = await readCached(filepath)
				const { data, content } = matter(source)
				const parsed = baseSchema.parse(data)
				const slug = `${prefix}${entry.name.replace(".mdx", "")}`

				docs.push({
					slug: slug === "index" ? "" : slug,
					title: parsed.title,
					description: parsed.description,
					order: parsed.order,
					content: stripMdx(content),
				})
			}
		}
	}

	try {
		await scan(docsDir)
	} catch (error) {
		if (error instanceof z.ZodError) {
			throw error
		}
		return []
	}

	const sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
	searchCache.set(cacheKey, sorted)
	return sorted
}

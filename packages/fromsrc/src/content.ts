import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import { z } from "zod"
import { loadMeta, sortByMeta, type MetaFile } from "./meta"
import { baseSchema } from "./schema"

export interface DocMeta {
	slug: string
	title: string
	description?: string
	order?: number
}

export interface Heading {
	id: string
	text: string
	level: number
}

export interface SearchDoc extends DocMeta {
	content: string
	headings?: Heading[]
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

const isProduction = () => process.env.NODE_ENV === "production"
const isDraft = (data: Record<string, unknown>) => data.draft === true

async function readCached(filepath: string): Promise<string> {
	if (!isProduction()) {
		return readFile(filepath, "utf-8")
	}
	const cached = fileCache.get(filepath)
	if (cached) return cached
	const content = await readFile(filepath, "utf-8")
	fileCache.set(filepath, content)
	return content
}

async function resolveSource(
	docsDir: string,
	slug: string[],
): Promise<{ source: string; actualPath: string; filepath: string } | null> {
	const path = slug.length === 0 ? "index" : slug.join("/")
	const filepath = join(docsDir, `${path}.mdx`)
	const indexPath = join(docsDir, `${path}/index.mdx`)
	try {
		const source = await readCached(filepath)
		return { source, actualPath: path, filepath }
	} catch {}
	try {
		const source = await readCached(indexPath)
		return { source, actualPath: `${path}/index`, filepath: indexPath }
	} catch {}
	return null
}

export function defineContent<T extends SchemaType>(config: ContentConfig<T>) {
	const schema = config.schema ?? baseSchema

	type Meta = z.infer<T> & { slug: string }
	type Document = Meta & { content: string; data: z.infer<T> }

	let docsCache: Meta[] | null = null
	let fullDocsCache: Document[] | null = null
	let navCache: { title: string; items: Meta[] }[] | null = null

	function asMeta(doc: Document): Meta {
		const { content: _content, data: _data, ...meta } = doc
		return meta
	}

	async function getDoc(slug: string[]): Promise<Document | null> {
		const resolved = await resolveSource(config.dir, slug)
		if (!resolved) return null

		try {
			const { data, content } = matter(resolved.source)
			const parsed = schema.parse(data)

			if (isProduction() && isDraft(data)) return null

			return {
				slug: resolved.actualPath,
				...parsed,
				content,
				data: parsed,
			}
		} catch (error) {
			if (error instanceof z.ZodError) {
				console.error(`Schema validation failed for ${resolved.filepath}:`)
				console.error(error.errors)
				throw error
			}
			console.error(`Failed to parse ${resolved.filepath}:`, error)
			return null
		}
	}

	async function getAllDocs(): Promise<Meta[]> {
		if (isProduction() && docsCache) return docsCache
		if (isProduction() && fullDocsCache) {
			const sorted = fullDocsCache.map(asMeta)
			docsCache = sorted
			return sorted
		}

		const docs: Meta[] = []

		async function scan(dir: string, prefix = ""): Promise<void> {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				if (entry.isDirectory()) {
					await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
				} else if (entry.name.endsWith(".mdx")) {
					const filepath = join(dir, entry.name)
					const source = await readCached(filepath)
					const { data } = matter(source)
					const parsed = schema.parse(data)

					if (isProduction() && isDraft(data)) continue

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
			console.error(`Failed to scan docs in ${config.dir}:`, error)
			return []
		}

		const sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
		if (isProduction()) {
			docsCache = sorted
		}
		return sorted
	}

	async function getDocs(): Promise<Document[]> {
		if (isProduction() && fullDocsCache) return fullDocsCache

		const docs: Document[] = []

		async function scan(dir: string, prefix = ""): Promise<void> {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				if (entry.isDirectory()) {
					await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
				} else if (entry.name.endsWith(".mdx")) {
					const filepath = join(dir, entry.name)
					const source = await readCached(filepath)
					const { data, content } = matter(source)
					const parsed = schema.parse(data)

					if (isProduction() && isDraft(data)) continue

					const slug = `${prefix}${entry.name.replace(".mdx", "")}`
					docs.push({
						slug: slug === "index" ? "" : slug,
						...parsed,
						content,
						data: parsed,
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
			console.error(`Failed to load docs in ${config.dir}:`, error)
			return []
		}

		const sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
		if (isProduction()) {
			fullDocsCache = sorted
		}
		return sorted
	}

	async function getNavigation(): Promise<{ title: string; items: Meta[] }[]> {
		if (isProduction() && navCache) return navCache

		try {
			const docs = await getAllDocs()
			const filtered = await buildNavigation(docs, config.dir)
			if (isProduction()) {
				navCache = filtered
			}
			return filtered
		} catch (error) {
			console.error(`Failed to build navigation for ${config.dir}:`, error)
			return []
		}
	}

	let searchCache: (Meta & { content: string; headings?: Heading[] })[] | null = null

	async function getSearchDocs(): Promise<(Meta & { content: string; headings?: Heading[] })[]> {
		if (isProduction() && searchCache) return searchCache
		if (isProduction() && fullDocsCache) {
			const sorted = fullDocsCache
				.map((doc) => {
					const headings = extractHeadings(doc.content)
					return {
						...asMeta(doc),
						content: stripMdx(doc.content),
						headings: headings.length > 0 ? headings : undefined,
					}
				})
				.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
			searchCache = sorted
			return sorted
		}

		const docs: (Meta & { content: string; headings?: Heading[] })[] = []

		async function scan(dir: string, prefix = ""): Promise<void> {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				if (entry.isDirectory()) {
					await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
				} else if (entry.name.endsWith(".mdx")) {
					const filepath = join(dir, entry.name)
					const source = await readCached(filepath)
					const { data, content } = matter(source)
					const parsed = schema.parse(data)

					if (isProduction() && isDraft(data)) continue

					const slug = `${prefix}${entry.name.replace(".mdx", "")}`
					const headings = extractHeadings(content)

					docs.push({
						slug: slug === "index" ? "" : slug,
						...parsed,
						content: stripMdx(content),
						headings: headings.length > 0 ? headings : undefined,
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
			console.error(`Failed to build search docs in ${config.dir}:`, error)
			return []
		}

		const sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
		if (isProduction()) {
			searchCache = sorted
		}
		return sorted
	}

	return {
		getDoc,
		getDocs,
		getAllDocs,
		getNavigation,
		getSearchDocs,
		schema,
	}
}

function stripHeadingFormatting(text: string): string {
	return text
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/`([^`]+)`/g, "$1")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.trim()
}

function headingId(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9_-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

export function extractHeadings(content: string): Heading[] {
	const headings: Heading[] = []
	const seen = new Map<string, number>()
	const lines = content.split("\n")

	for (const line of lines) {
		const match = line.match(/^(#{2,4})\s+(.+)$/)
		if (!match) continue
		const hashes = match[1]
		const heading = match[2]
		if (!hashes || !heading) continue
		const level = hashes.length
		const raw = stripHeadingFormatting(heading)
		const base = headingId(raw)
		if (!base) continue
		const count = seen.get(base) ?? 0
		seen.set(base, count + 1)
		const id = count === 0 ? base : `${base}-${count}`
		headings.push({ id, text: raw, level })
	}

	return headings
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
	const resolved = await resolveSource(docsDir, slug)
	if (!resolved) return null

	try {
		const { data, content } = matter(resolved.source)
		const parsed = baseSchema.parse(data)

		if (isProduction() && isDraft(data)) return null

		return {
			slug: resolved.actualPath,
			title: parsed.title,
			description: parsed.description,
			order: parsed.order,
			content,
			data: parsed,
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			console.error(`Schema validation failed for ${resolved.filepath}:`)
			console.error(error.errors)
			throw error
		}
		console.error(`Failed to parse ${resolved.filepath}:`, error)
		return null
	}
}

export async function getAllDocs(docsDir: string): Promise<DocMeta[]> {
	const cacheKey = docsDir
	if (isProduction()) {
		const cached = metaCache.get(cacheKey)
		if (cached) return cached
	}

	const docs: DocMeta[] = []
	const folderMetas = new Map<string, MetaFile | null>()

	async function scan(dir: string, prefix = ""): Promise<void> {
		const entries = await readdir(dir, { withFileTypes: true })
		const meta = await loadMeta(dir)
		folderMetas.set(prefix, meta)

		for (const entry of entries) {
			if (entry.isDirectory()) {
				await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				const filepath = join(dir, entry.name)
				const source = await readCached(filepath)
				const { data } = matter(source)
				const parsed = baseSchema.parse(data)

				if (isProduction() && isDraft(data)) continue

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
		console.error(`Failed to scan docs in ${docsDir}:`, error)
		return []
	}

	const rootMeta = folderMetas.get("")
	let sorted: DocMeta[]

	if (rootMeta?.pages) {
		sorted = sortByMeta(docs, rootMeta.pages, "")
	} else {
		sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
	}

	if (isProduction()) {
		metaCache.set(cacheKey, sorted)
	}
	return sorted
}

export async function getNavigation(docsDir: string): Promise<{ title: string; items: DocMeta[] }[]> {
	try {
		const docs = await getAllDocs(docsDir)
		return buildNavigation(docs, docsDir)
	} catch (error) {
		console.error(`Failed to build navigation for ${docsDir}:`, error)
		return []
	}
}

const searchCache = new Map<string, SearchDoc[]>()

export async function getSearchDocs(docsDir: string): Promise<SearchDoc[]> {
	const cacheKey = docsDir
	if (isProduction()) {
		const cached = searchCache.get(cacheKey)
		if (cached) return cached
	}

	const docs: SearchDoc[] = []

	async function scan(dir: string, prefix = ""): Promise<void> {
		const entries = await readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			if (entry.isDirectory()) {
				await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				const filepath = join(dir, entry.name)
				const source = await readCached(filepath)
				const { data, content } = matter(source)
				const parsed = baseSchema.parse(data)

				if (isProduction() && isDraft(data)) continue

				const slug = `${prefix}${entry.name.replace(".mdx", "")}`
				const headings = extractHeadings(content)

				docs.push({
					slug: slug === "index" ? "" : slug,
					title: parsed.title,
					description: parsed.description,
					order: parsed.order,
					content: stripMdx(content),
					headings: headings.length > 0 ? headings : undefined,
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
		console.error(`Failed to build search docs in ${docsDir}:`, error)
		return []
	}

	const sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
	if (isProduction()) {
		searchCache.set(cacheKey, sorted)
	}
	return sorted
}

interface navsection<T> {
	key: string
	title: string
	items: T[]
}

type navitem = { slug: string; order?: number }

function fallbacktitle(key: string): string {
	if (key === "") return "docs"
	return key.replace(/-/g, " ")
}

async function buildNavigation<T extends navitem>(
	docs: T[],
	docsDir: string,
): Promise<{ title: string; items: T[] }[]> {
	const grouped = new Map<string, navsection<T>>()

	for (const doc of docs) {
		const key = groupkey(doc.slug)
		const section = grouped.get(key) ?? {
			key,
			title: fallbacktitle(key),
			items: [],
		}
		section.items.push(doc)
		grouped.set(key, section)
	}

	const rootMeta = await loadMeta(docsDir)
	const order = sectionOrder(rootMeta?.pages)
	const sections = [...grouped.values()]
	sections.sort((left, right) => {
		const leftOrder = order.get(left.key)
		const rightOrder = order.get(right.key)
		if (leftOrder !== undefined && rightOrder !== undefined) return leftOrder - rightOrder
		if (leftOrder !== undefined) return -1
		if (rightOrder !== undefined) return 1
		if (left.key === "") return -1
		if (right.key === "") return 1
		return left.key.localeCompare(right.key)
	})

	const metas = await Promise.all(
		sections.map((section) => {
			if (section.key === "") return Promise.resolve(rootMeta)
			return loadMeta(join(docsDir, section.key))
		}),
	)

	return sections
		.map((section, index) => {
			const prefix = section.key ? `${section.key}/` : ""
			const sorted = sortByMeta(section.items, metas[index]?.pages, prefix)
			const label = metas[index]?.title ?? section.title
			return {
				title: label,
				items: sorted,
			}
		})
		.filter((section) => section.items.length > 0)
}

function sectionOrder(pages: string[] | undefined): Map<string, number> {
	const order = new Map<string, number>()
	if (!pages) return order
	for (const page of pages) {
		const key = groupkey(page)
		if (!order.has(key)) {
			order.set(key, order.size)
		}
	}
	return order
}

function groupkey(slug: string): string {
	if (!slug || slug === "index") return ""
	if (!slug.includes("/")) return ""
	const [head] = slug.split("/")
	if (!head || head === "index") return ""
	return head
}

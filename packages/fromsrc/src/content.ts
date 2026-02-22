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
			const parsed = schema.parse(data)

			if (isProduction() && isDraft(data)) return null

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

		const docs = await getAllDocs()

		const intro: { title: string; items: Meta[] } = { title: "introduction", items: [] }
		const manual: { title: string; items: Meta[] } = { title: "manual", items: [] }
		const components: { title: string; items: Meta[] } = { title: "components", items: [] }
		const apis: { title: string; items: Meta[] } = { title: "api", items: [] }
		const examples: { title: string; items: Meta[] } = { title: "examples", items: [] }
		const sections = [intro, manual, components, apis, examples]

		for (const doc of docs) {
			if (doc.slug.startsWith("components/")) {
				components.items.push(doc)
			} else if (doc.slug.startsWith("manual/")) {
				manual.items.push(doc)
			} else if (doc.slug.startsWith("api/")) {
				apis.items.push(doc)
			} else if (doc.slug.startsWith("examples/")) {
				examples.items.push(doc)
			} else {
				intro.items.push(doc)
			}
		}
		const [manualMeta, componentsMeta, apiMeta, examplesMeta] = await Promise.all([
			loadMeta(join(config.dir, "manual")),
			loadMeta(join(config.dir, "components")),
			loadMeta(join(config.dir, "api")),
			loadMeta(join(config.dir, "examples")),
		])
		manual.items = sortByMeta(manual.items, manualMeta?.pages, "manual/")
		components.items = sortByMeta(components.items, componentsMeta?.pages, "components/")
		apis.items = sortByMeta(apis.items, apiMeta?.pages, "api/")
		examples.items = sortByMeta(examples.items, examplesMeta?.pages, "examples/")

		const filtered = sections.filter((s) => s.items.length > 0)
		if (isProduction()) {
			navCache = filtered
		}
		return filtered
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

		if (isProduction() && isDraft(data)) return null

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
	const docs = await getAllDocs(docsDir)

	const intro: { title: string; items: DocMeta[] } = { title: "introduction", items: [] }
	const manual: { title: string; items: DocMeta[] } = { title: "manual", items: [] }
	const components: { title: string; items: DocMeta[] } = { title: "components", items: [] }
	const apis: { title: string; items: DocMeta[] } = { title: "api", items: [] }
	const examples: { title: string; items: DocMeta[] } = { title: "examples", items: [] }
	const sections = [intro, manual, components, apis, examples]

	for (const doc of docs) {
		if (doc.slug.startsWith("components/")) {
			components.items.push(doc)
		} else if (doc.slug.startsWith("manual/")) {
			manual.items.push(doc)
		} else if (doc.slug.startsWith("api/")) {
			apis.items.push(doc)
		} else if (doc.slug.startsWith("examples/")) {
			examples.items.push(doc)
		} else {
			intro.items.push(doc)
		}
	}
	const [manualMeta, componentsMeta, apiMeta, examplesMeta] = await Promise.all([
		loadMeta(join(docsDir, "manual")),
		loadMeta(join(docsDir, "components")),
		loadMeta(join(docsDir, "api")),
		loadMeta(join(docsDir, "examples")),
	])
	manual.items = sortByMeta(manual.items, manualMeta?.pages, "manual/")
	components.items = sortByMeta(components.items, componentsMeta?.pages, "components/")
	apis.items = sortByMeta(apis.items, apiMeta?.pages, "api/")
	examples.items = sortByMeta(examples.items, examplesMeta?.pages, "examples/")

	return sections.filter((s) => s.items.length > 0)
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
		return []
	}

	const sorted = docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
	if (isProduction()) {
		searchCache.set(cacheKey, sorted)
	}
	return sorted
}

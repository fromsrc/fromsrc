import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import { z } from "zod"

interface CollectionConfig<T extends z.ZodRawShape> {
	name: string
	dir: string
	schema: z.ZodObject<T>
}

interface CollectionItem<T> {
	slug: string
	content: string
	data: T
}

interface Collection<T> {
	name: string
	getAll(): Promise<CollectionItem<T>[]>
	get(slug: string): Promise<CollectionItem<T> | null>
	count(): Promise<number>
	filter(fn: (doc: CollectionItem<T>) => boolean): Promise<CollectionItem<T>[]>
	sort(key: keyof CollectionItem<T>, order?: "asc" | "desc"): Promise<CollectionItem<T>[]>
}

type InferCollection<T extends z.ZodRawShape> = z.infer<z.ZodObject<T>>

async function scan<T extends z.ZodRawShape>(
	dir: string,
	schema: z.ZodObject<T>,
): Promise<CollectionItem<InferCollection<T>>[]> {
	const items: CollectionItem<InferCollection<T>>[] = []

	async function walk(current: string, prefix = ""): Promise<void> {
		const entries = await readdir(current, { withFileTypes: true })
		for (const entry of entries) {
			if (entry.isDirectory()) {
				await walk(join(current, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				const filepath = join(current, entry.name)
				const source = await readFile(filepath, "utf-8")
				const { data, content } = matter(source)
				const parsed = schema.parse(data)
				const slug = `${prefix}${entry.name.replace(".mdx", "")}`
				items.push({ slug, content, data: parsed })
			}
		}
	}

	await walk(dir)
	return items
}

export function defineCollection<T extends z.ZodRawShape>(
	config: CollectionConfig<T>,
): Collection<InferCollection<T>> {
	type Item = CollectionItem<InferCollection<T>>
	let cached: Item[] | null = null

	async function load(): Promise<Item[]> {
		if (cached) return cached
		const items = await scan(config.dir, config.schema)
		cached = items
		return items
	}

	return {
		name: config.name,
		getAll: () => load(),
		get: async (slug) => {
			const items = await load()
			return items.find((item) => item.slug === slug) ?? null
		},
		count: async () => (await load()).length,
		filter: async (fn) => (await load()).filter(fn),
		sort: async (key, order = "asc") => {
			const items = await load()
			return [...items].sort((a, b) => {
				const va = a[key]
				const vb = b[key]
				if (va < vb) return order === "asc" ? -1 : 1
				if (va > vb) return order === "asc" ? 1 : -1
				return 0
			})
		},
	}
}

export function defineCollections<T extends Record<string, CollectionConfig<z.ZodRawShape>>>(
	configs: T,
): { [K in keyof T]: Collection<z.infer<T[K]["schema"]>> } {
	const result = {} as Record<string, Collection<unknown>>
	for (const [key, config] of Object.entries(configs)) {
		result[key] = defineCollection(config)
	}
	return result as { [K in keyof T]: Collection<z.infer<T[K]["schema"]>> }
}

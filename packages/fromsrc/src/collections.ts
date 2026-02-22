import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import { z } from "zod"

interface CollectionConfig<T extends z.ZodRawShape> {
	name: string
	dir: string
	schema: z.ZodObject<T>
	includeDrafts?: boolean
}

interface CollectionItem<T> {
	slug: string
	content: string
	data: T
}

type SortValue = string | number | bigint | boolean | Date
type SortKey<T> = {
	[K in keyof T]: T[K] extends SortValue ? K : never
}[keyof T]

interface Collection<T> {
	name: string
	getAll(): Promise<CollectionItem<T>[]>
	get(slug: string): Promise<CollectionItem<T> | null>
	count(): Promise<number>
	filter(fn: (doc: CollectionItem<T>) => boolean): Promise<CollectionItem<T>[]>
	sort(key: "slug" | SortKey<T>, order?: "asc" | "desc"): Promise<CollectionItem<T>[]>
}

type InferCollection<T extends z.ZodRawShape> = z.infer<z.ZodObject<T>>
type InferSchema<T extends CollectionConfig<z.ZodRawShape>> = z.infer<T["schema"]>

async function scan<T extends z.ZodRawShape>(
	dir: string,
	schema: z.ZodObject<T>,
	includeDrafts: boolean,
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
				if (!includeDrafts && (data as Record<string, unknown>).draft === true) continue
				const parsed = schema.safeParse(data)
				if (!parsed.success) {
					console.error(`invalid frontmatter in ${filepath}`)
					continue
				}
				const slug = `${prefix}${entry.name.replace(".mdx", "")}`
				items.push({ slug, content, data: parsed.data })
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

	function compare(a: SortValue | undefined, b: SortValue | undefined): number {
		if (a === b) return 0
		if (a === undefined) return -1
		if (b === undefined) return 1
		if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
		if (typeof a === "string" && typeof b === "string") return a.localeCompare(b)
		if (typeof a === "number" && typeof b === "number") return a - b
		if (typeof a === "bigint" && typeof b === "bigint") return a < b ? -1 : 1
		if (typeof a === "boolean" && typeof b === "boolean") return a === b ? 0 : a ? 1 : -1
		return String(a).localeCompare(String(b))
	}

	async function load(): Promise<Item[]> {
		if (cached) return cached
		const includeDrafts = config.includeDrafts ?? process.env.NODE_ENV !== "production"
		const items = await scan(config.dir, config.schema, includeDrafts)
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
				const va = key === "slug" ? a.slug : a.data[key]
				const vb = key === "slug" ? b.slug : b.data[key]
				const result = compare(va, vb)
				return order === "asc" ? result : -result
			})
		},
	}
}

export function defineCollections<const T extends Record<string, CollectionConfig<z.ZodRawShape>>>(
	configs: T,
): { [K in keyof T]: Collection<z.infer<T[K]["schema"]>> } {
	const result = {} as { [K in keyof T]: Collection<InferSchema<T[K]>> }
	for (const key of Object.keys(configs) as (keyof T)[]) {
		const config = configs[key]
		if (config === undefined) {
			throw new Error(`missing collection config: ${String(key)}`)
		}
		result[key] = defineCollection(config)
	}
	return result
}

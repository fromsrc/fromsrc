import { readFile, readdir } from "node:fs/promises"
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

export interface Doc<T extends Record<string, unknown> = Record<string, unknown>> extends DocMeta {
	content: string
	data: T
}

type SchemaType = z.ZodObject<z.ZodRawShape>

export interface ContentConfig<T extends SchemaType = typeof baseSchema> {
	dir: string
	schema?: T
}

export function defineContent<T extends SchemaType>(config: ContentConfig<T>) {
	const schema = config.schema ?? baseSchema

	type Meta = z.infer<T> & { slug: string }
	type Document = Meta & { content: string; data: z.infer<T> }

	async function getDoc(slug: string[]): Promise<Document | null> {
		const path = slug.length === 0 ? "index" : slug.join("/")
		const filepath = join(config.dir, `${path}.mdx`)

		try {
			const source = await readFile(filepath, "utf-8")
			const { data, content } = matter(source)
			const parsed = schema.parse(data) as z.infer<T>

			return {
				slug: path,
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
		const docs: Meta[] = []

		async function scan(dir: string, prefix = "") {
			const entries = await readdir(dir, { withFileTypes: true })

			for (const entry of entries) {
				if (entry.isDirectory()) {
					await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
				} else if (entry.name.endsWith(".mdx")) {
					const filepath = join(dir, entry.name)
					const source = await readFile(filepath, "utf-8")
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

		return docs.sort((a, b) => ((a.order as number) ?? 99) - ((b.order as number) ?? 99))
	}

	async function getNavigation() {
		const docs = await getAllDocs()

		const sections: { title: string; items: Meta[] }[] = [
			{ title: "introduction", items: [] },
			{ title: "components", items: [] },
			{ title: "api", items: [] },
		]

		for (const doc of docs) {
			if (doc.slug.startsWith("components/")) {
				sections[1].items.push(doc)
			} else if (doc.slug.startsWith("api/")) {
				sections[2].items.push(doc)
			} else {
				sections[0].items.push(doc)
			}
		}

		return sections.filter((s) => s.items.length > 0)
	}

	return {
		getDoc,
		getAllDocs,
		getNavigation,
		schema,
	}
}

export async function getDoc(docsDir: string, slug: string[]): Promise<Doc | null> {
	const path = slug.length === 0 ? "index" : slug.join("/")
	const filepath = join(docsDir, `${path}.mdx`)

	try {
		const source = await readFile(filepath, "utf-8")
		const { data, content } = matter(source)
		const parsed = baseSchema.parse(data)

		return {
			slug: path,
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
	const docs: DocMeta[] = []

	async function scan(dir: string, prefix = "") {
		const entries = await readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			if (entry.isDirectory()) {
				await scan(join(dir, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				const filepath = join(dir, entry.name)
				const source = await readFile(filepath, "utf-8")
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

	return docs.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
}

export async function getNavigation(docsDir: string) {
	const docs = await getAllDocs(docsDir)

	const sections: { title: string; items: DocMeta[] }[] = [
		{ title: "introduction", items: [] },
		{ title: "components", items: [] },
		{ title: "api", items: [] },
	]

	for (const doc of docs) {
		if (doc.slug.startsWith("components/")) {
			sections[1].items.push(doc)
		} else if (doc.slug.startsWith("api/")) {
			sections[2].items.push(doc)
		} else {
			sections[0].items.push(doc)
		}
	}

	return sections.filter((s) => s.items.length > 0)
}

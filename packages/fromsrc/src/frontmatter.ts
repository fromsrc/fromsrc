import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"
import type { ZodSchema } from "zod"

export interface FrontmatterResult<T> {
	data: T
	content: string
	valid: true
}

export interface FrontmatterError {
	valid: false
	errors: string[]
	content: string
}

export function parseFrontmatter<T>(
	source: string,
	schema: ZodSchema<T>,
): FrontmatterResult<T> | FrontmatterError {
	try {
		const { data, content } = matter(source)
		const result = schema.safeParse(data)

		if (result.success) {
			return {
				data: result.data,
				content,
				valid: true,
			}
		}

		const errors = result.error.errors.map((err) => {
			const path = err.path.join(".")
			return path ? `${path}: ${err.message}` : err.message
		})

		return {
			valid: false,
			errors,
			content,
		}
	} catch (error) {
		return {
			valid: false,
			errors: [error instanceof Error ? error.message : "Failed to parse frontmatter"],
			content: source,
		}
	}
}

async function getAllMdxFiles(dir: string): Promise<string[]> {
	const files: string[] = []

	async function scan(currentDir: string) {
		const entries = await readdir(currentDir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = join(currentDir, entry.name)

			if (entry.isDirectory()) {
				await scan(fullPath)
			} else if (entry.isFile() && entry.name.endsWith(".mdx")) {
				files.push(fullPath)
			}
		}
	}

	await scan(dir)
	return files
}

export async function validateAllFrontmatter<T>(
	docsDir: string,
	schema: ZodSchema<T>,
): Promise<{ path: string; errors: string[] }[]> {
	const files = await getAllMdxFiles(docsDir)
	const results: { path: string; errors: string[] }[] = []

	for (const file of files) {
		const source = await readFile(file, "utf-8")
		const result = parseFrontmatter(source, schema)

		if (!result.valid) {
			results.push({
				path: file,
				errors: result.errors,
			})
		}
	}

	return results
}

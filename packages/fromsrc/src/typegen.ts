import { readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import matter from "gray-matter"

export interface TypegenConfig {
	dir: string
	output: string
	schemaName?: string
}

export function inferType(value: unknown): string {
	if (value === null || value === undefined) return "unknown"
	if (typeof value === "string") return "string"
	if (typeof value === "number") return "number"
	if (typeof value === "boolean") return "boolean"
	if (Array.isArray(value)) {
		if (value.length === 0) return "unknown[]"
		const types = [...new Set(value.map(inferType))]
		return types.length === 1 ? `${types[0]}[]` : `(${types.join(" | ")})[]`
	}
	if (typeof value === "object") {
		const entries = Object.entries(value as Record<string, unknown>)
		if (entries.length === 0) return "Record<string, unknown>"
		const fields = entries.map(([k, v]) => `${k}: ${inferType(v)}`).join("; ")
		return `{ ${fields} }`
	}
	return "unknown"
}

async function scanFiles(dir: string): Promise<string[]> {
	const paths: string[] = []
	async function walk(current: string) {
		const entries = await readdir(current, { withFileTypes: true })
		for (const entry of entries) {
			const full = join(current, entry.name)
			if (entry.isDirectory()) await walk(full)
			else if (entry.name.endsWith(".mdx")) paths.push(full)
		}
	}
	await walk(dir)
	return paths
}

export async function generateTypes(config: TypegenConfig): Promise<string> {
	const name = config.schemaName ?? "DocFrontmatter"
	const files = await scanFiles(config.dir)
	const fieldTypes = new Map<string, Set<string>>()
	const fieldCounts = new Map<string, number>()
	let total = 0

	for (const file of files) {
		const source = await readFile(file, "utf-8")
		const { data } = matter(source)
		if (!data || typeof data !== "object") continue
		total++
		for (const [key, value] of Object.entries(data)) {
			const type = inferType(value)
			let field = fieldTypes.get(key)
			if (!field) {
				field = new Set()
				fieldTypes.set(key, field)
			}
			field.add(type)
			fieldCounts.set(key, (fieldCounts.get(key) ?? 0) + 1)
		}
	}

	const lines: string[] = [`export interface ${name} {`]
	const sorted = [...fieldTypes.entries()].sort(([a], [b]) => a.localeCompare(b))

	for (const [key, types] of sorted) {
		const optional = (fieldCounts.get(key) ?? 0) < total
		const union = [...types].join(" | ")
		const suffix = optional ? "?" : ""
		lines.push(`\t${key}${suffix}: ${union}`)
	}

	lines.push("}")
	return lines.join("\n") + "\n"
}

export async function writeTypes(config: TypegenConfig): Promise<void> {
	const content = await generateTypes(config)
	await writeFile(config.output, content, "utf-8")
}

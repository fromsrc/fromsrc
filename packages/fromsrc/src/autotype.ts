import { readFile } from "node:fs/promises"

export interface TypeProperty {
	name: string
	type: string
	required: boolean
	description?: string
	default?: string
}

export interface TypeDefinition {
	name: string
	description?: string
	properties: TypeProperty[]
	extends?: string[]
}

const BLOCK_PATTERN =
	/(?:\/\*\*\s*([\s\S]*?)\s*\*\/\s*)?(?:export\s+)?(?:interface|type)\s+(\w+)(?:<[^>]*>)?(?:\s*=\s*\{|\s*(?:extends\s+([\w\s,<>]+))?\s*\{)([\s\S]*?)\n\}/g

const PROP_PATTERN =
	/(?:\/\*\*\s*([\s\S]*?)\s*\*\/\s*)?(?:readonly\s+)?(\w+)(\??)\s*:\s*([^;\n]+)/g

function clean(raw: string): string {
	return raw
		.replace(/^\s*\*\s?/gm, "")
		.replace(/@default\s+.*/g, "")
		.trim()
}

function extractDefault(raw: string): string | undefined {
	const match = raw.match(/@default\s+(.+)/)
	return match?.[1]?.trim()
}

function normalizeType(raw: string): string {
	return raw.replace(/\s+/g, " ").trim()
}

function parseExtends(raw: string): string[] {
	return raw.split(",").map((s) => s.replace(/<.*>/, "").trim())
}

function parseProperties(body: string): TypeProperty[] {
	const properties: TypeProperty[] = []
	const pattern = new RegExp(PROP_PATTERN.source, PROP_PATTERN.flags)
	let match: RegExpExecArray | null = null

	while ((match = pattern.exec(body)) !== null) {
		const jsdoc = match[1] as string | undefined
		const name = match[2]!
		const optional = match[3]!
		const rawType = match[4]!
		const property: TypeProperty = {
			name,
			type: normalizeType(rawType),
			required: optional !== "?",
		}

		if (jsdoc) {
			const description = clean(jsdoc)
			if (description) property.description = description
			const def = extractDefault(jsdoc)
			if (def) property.default = def
		}

		properties.push(property)
	}

	return properties
}

export function parseTypes(source: string): TypeDefinition[] {
	const definitions: TypeDefinition[] = []
	const pattern = new RegExp(BLOCK_PATTERN.source, BLOCK_PATTERN.flags)
	let match: RegExpExecArray | null = null

	while ((match = pattern.exec(source)) !== null) {
		const jsdoc = match[1] as string | undefined
		const name = match[2]!
		const extendsClause = match[3] as string | undefined
		const body = match[4]!
		const definition: TypeDefinition = {
			name,
			properties: parseProperties(body),
		}

		if (jsdoc) {
			const description = clean(jsdoc)
			if (description) definition.description = description
		}

		if (extendsClause) {
			definition.extends = parseExtends(extendsClause)
		}

		definitions.push(definition)
	}

	return definitions
}

export async function parseTypeFile(filePath: string): Promise<TypeDefinition[]> {
	const source = await readFile(filePath, "utf-8")
	return parseTypes(source)
}

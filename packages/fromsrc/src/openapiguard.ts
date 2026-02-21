import type { OpenApiTag } from "./openapiutil"

type jsonrecord = Record<string, unknown>

interface rootvalue {
	info: {
		title: string
		version: string
		description?: string
	}
	paths: Record<string, unknown>
	tags: OpenApiTag[]
	components?: {
		schemas?: Record<string, unknown>
	}
	definitions?: Record<string, unknown>
}

function isrecord(value: unknown): value is jsonrecord {
	return typeof value === "object" && value !== null
}

function totext(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined
}

function torecord(value: unknown): Record<string, unknown> | undefined {
	return isrecord(value) ? value : undefined
}

function parseinfo(value: unknown): rootvalue["info"] {
	const input = torecord(value) ?? {}
	return {
		title: totext(input.title) ?? "",
		version: totext(input.version) ?? "",
		description: totext(input.description),
	}
}

function parsetags(value: unknown): OpenApiTag[] {
	if (!Array.isArray(value)) return []
	return value.flatMap((item) => {
		const input = torecord(item)
		if (!input) return []
		const name = totext(input.name)
		if (!name || name.length === 0) return []
		return [{ name, description: totext(input.description) }]
	})
}

function parsepaths(value: unknown): Record<string, unknown> {
	return torecord(value) ?? {}
}

function parsecomponents(value: unknown): rootvalue["components"] {
	const input = torecord(value)
	if (!input) return undefined
	const schemas = torecord(input.schemas)
	if (!schemas) return undefined
	return { schemas }
}

function parsedefinitions(value: unknown): rootvalue["definitions"] {
	return torecord(value)
}

function parseroot(value: unknown): rootvalue {
	if (!isrecord(value)) {
		throw new Error("invalid openapi specification")
	}
	return {
		info: parseinfo(value.info),
		paths: parsepaths(value.paths),
		tags: parsetags(value.tags),
		components: parsecomponents(value.components),
		definitions: parsedefinitions(value.definitions),
	}
}

export const rootschema = {
	parse: parseroot,
}

export function parsespec(spec: string | object): unknown {
	if (typeof spec === "string") {
		const text = spec.trim()
		if (text.length === 0) {
			throw new Error("invalid openapi specification")
		}
		try {
			return JSON.parse(text)
		} catch {
			throw new Error("invalid openapi specification")
		}
	}
	return spec
}

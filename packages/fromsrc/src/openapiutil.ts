export type OpenApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE"

export interface OpenApiSchema {
	type?: string
	format?: string
	description?: string
	properties?: Record<string, OpenApiSchema>
	items?: OpenApiSchema
	required?: string[]
	enum?: string[]
	oneOf?: OpenApiSchema[]
	anyOf?: OpenApiSchema[]
	allOf?: OpenApiSchema[]
	nullable?: boolean
	default?: unknown
	example?: unknown
}

export interface OpenApiParameter {
	name: string
	in: "query" | "path" | "header" | "cookie"
	required?: boolean
	description?: string
	schema?: OpenApiSchema
}

export interface OpenApiRequestBody {
	description?: string
	required?: boolean
	content: Record<string, { schema: OpenApiSchema }>
}

export interface OpenApiResponse {
	status: string
	description?: string
	content?: Record<string, { schema: OpenApiSchema }>
}

export interface OpenApiEndpoint {
	method: OpenApiMethod
	path: string
	operationId?: string
	summary?: string
	description?: string
	tags: string[]
	parameters: OpenApiParameter[]
	requestBody?: OpenApiRequestBody
	responses: OpenApiResponse[]
	deprecated?: boolean
	security?: string[]
}

export interface OpenApiTag {
	name: string
	description?: string
}

export interface OpenApiSpec {
	info: { title: string; version: string; description?: string }
	endpoints: OpenApiEndpoint[]
	tags: OpenApiTag[]
	schemas: Record<string, OpenApiSchema>
}

export function generateEndpointSlug(method: string, path: string): string {
	return `${method.toLowerCase()}-${path.replace(/^\//, "").replace(/[/{}}]/g, "-").replace(/-+/g, "-").replace(/-$/, "")}`
}

type jsonrecord = Record<string, unknown>

function isrecord(value: unknown): value is jsonrecord {
	return typeof value === "object" && value !== null
}

export function resolveRef(root: unknown, ref: string): unknown {
	if (!ref.startsWith("#/")) return {}
	const parts = ref.slice(2).split("/")
	let current: unknown = root
	for (const part of parts) {
		if (!isrecord(current)) return {}
		current = current[part]
		if (current === undefined) return {}
	}
	return current
}

export function resolveSchema(root: unknown, raw: unknown): OpenApiSchema {
	if (!isrecord(raw)) return {}
	if (typeof raw.$ref === "string") return resolveSchema(root, resolveRef(root, raw.$ref))

	const schema: OpenApiSchema = {}
	if (typeof raw.type === "string") schema.type = raw.type
	if (typeof raw.format === "string") schema.format = raw.format
	if (typeof raw.description === "string") schema.description = raw.description
	if (typeof raw.nullable === "boolean") schema.nullable = raw.nullable
	if (raw.default !== undefined) schema.default = raw.default
	if (raw.example !== undefined) schema.example = raw.example
	if (Array.isArray(raw.enum)) schema.enum = raw.enum.filter((item): item is string => typeof item === "string")
	if (Array.isArray(raw.required)) {
		schema.required = raw.required.filter((item): item is string => typeof item === "string")
	}

	if (isrecord(raw.properties)) {
		schema.properties = {}
		for (const [key, val] of Object.entries(raw.properties)) {
			schema.properties[key] = resolveSchema(root, val)
		}
	}

	if (raw.items) schema.items = resolveSchema(root, raw.items)
	if (Array.isArray(raw.oneOf)) schema.oneOf = raw.oneOf.map((schemaitem) => resolveSchema(root, schemaitem))
	if (Array.isArray(raw.anyOf)) schema.anyOf = raw.anyOf.map((schemaitem) => resolveSchema(root, schemaitem))
	if (Array.isArray(raw.allOf)) schema.allOf = raw.allOf.map((schemaitem) => resolveSchema(root, schemaitem))

	return schema
}

export function resolveContent(
	root: unknown,
	raw: unknown,
): Record<string, { schema: OpenApiSchema }> | undefined {
	if (!isrecord(raw)) return undefined
	const result: Record<string, { schema: OpenApiSchema }> = {}
	for (const [mediaType, val] of Object.entries(raw)) {
		const value = isrecord(val) ? val.schema : undefined
		result[mediaType] = { schema: resolveSchema(root, value) }
	}
	return result
}

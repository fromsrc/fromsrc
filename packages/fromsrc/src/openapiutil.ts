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
	default?: any
	example?: any
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

export function resolveRef(root: any, ref: string): any {
	if (!ref.startsWith("#/")) return {}
	const parts = ref.slice(2).split("/")
	let current = root
	for (const part of parts) {
		current = current?.[part]
		if (current === undefined) return {}
	}
	return current
}

export function resolveSchema(root: any, raw: any): OpenApiSchema {
	if (!raw) return {}
	if (raw.$ref) return resolveSchema(root, resolveRef(root, raw.$ref))

	const schema: OpenApiSchema = {}
	if (raw.type) schema.type = raw.type
	if (raw.format) schema.format = raw.format
	if (raw.description) schema.description = raw.description
	if (raw.nullable) schema.nullable = raw.nullable
	if (raw.default !== undefined) schema.default = raw.default
	if (raw.example !== undefined) schema.example = raw.example
	if (raw.enum) schema.enum = raw.enum
	if (raw.required) schema.required = raw.required

	if (raw.properties) {
		schema.properties = {}
		for (const [key, val] of Object.entries(raw.properties)) {
			schema.properties[key] = resolveSchema(root, val)
		}
	}

	if (raw.items) schema.items = resolveSchema(root, raw.items)
	if (raw.oneOf) schema.oneOf = raw.oneOf.map((s: any) => resolveSchema(root, s))
	if (raw.anyOf) schema.anyOf = raw.anyOf.map((s: any) => resolveSchema(root, s))
	if (raw.allOf) schema.allOf = raw.allOf.map((s: any) => resolveSchema(root, s))

	return schema
}

export function resolveContent(
	root: any,
	raw: Record<string, any> | undefined,
): Record<string, { schema: OpenApiSchema }> | undefined {
	if (!raw) return undefined
	const result: Record<string, { schema: OpenApiSchema }> = {}
	for (const [mediaType, val] of Object.entries(raw)) {
		result[mediaType] = { schema: resolveSchema(root, val?.schema) }
	}
	return result
}

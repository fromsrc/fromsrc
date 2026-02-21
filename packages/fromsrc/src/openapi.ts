import {
	type OpenApiEndpoint,
	type OpenApiMethod,
	type OpenApiParameter,
	type OpenApiRequestBody,
	type OpenApiResponse,
	type OpenApiSchema,
	type OpenApiSpec,
	type OpenApiTag,
	generateEndpointSlug,
	resolveContent,
	resolveRef,
	resolveSchema,
} from "./openapiutil"

export type {
	OpenApiEndpoint,
	OpenApiMethod,
	OpenApiParameter,
	OpenApiRequestBody,
	OpenApiResponse,
	OpenApiSchema,
	OpenApiSpec,
	OpenApiTag,
}
export { generateEndpointSlug }

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options", "trace"] as const

function extractParameters(root: any, raw: any[]): OpenApiParameter[] {
	if (!raw) return []
	return raw.map((p) => {
		const resolved = p.$ref ? resolveRef(root, p.$ref) : p
		return {
			name: resolved.name,
			in: resolved.in,
			required: resolved.required || undefined,
			description: resolved.description || undefined,
			schema: resolved.schema ? resolveSchema(root, resolved.schema) : undefined,
		}
	})
}

function extractRequestBody(root: any, raw: any): OpenApiRequestBody | undefined {
	if (!raw) return undefined
	const resolved = raw.$ref ? resolveRef(root, raw.$ref) : raw
	return {
		description: resolved.description || undefined,
		required: resolved.required || undefined,
		content: resolveContent(root, resolved.content) ?? {},
	}
}

function extractResponses(root: any, raw: Record<string, any>): OpenApiResponse[] {
	if (!raw) return []
	return Object.entries(raw).map(([status, val]) => {
		const resolved = val.$ref ? resolveRef(root, val.$ref) : val
		return {
			status,
			description: resolved.description || undefined,
			content: resolveContent(root, resolved.content),
		}
	})
}

function extractSecurity(raw: any[]): string[] | undefined {
	if (!raw?.length) return undefined
	const names = new Set<string>()
	for (const item of raw) {
		for (const key of Object.keys(item)) {
			names.add(key)
		}
	}
	return Array.from(names)
}

function extractEndpoints(root: any): OpenApiEndpoint[] {
	const paths = root.paths || {}
	const endpoints: OpenApiEndpoint[] = []

	for (const [path, methods] of Object.entries<any>(paths)) {
		const shared = methods.parameters || []

		for (const method of HTTP_METHODS) {
			const op = methods[method]
			if (!op) continue

			const params = [...shared, ...(op.parameters || [])]

			endpoints.push({
				method: method.toUpperCase() as OpenApiMethod,
				path,
				operationId: op.operationId || undefined,
				summary: op.summary || undefined,
				description: op.description || undefined,
				tags: op.tags || [],
				parameters: extractParameters(root, params),
				requestBody: extractRequestBody(root, op.requestBody),
				responses: extractResponses(root, op.responses),
				deprecated: op.deprecated || undefined,
				security: extractSecurity(op.security),
			})
		}
	}

	return endpoints
}

function extractSchemas(root: any): Record<string, OpenApiSchema> {
	const raw = root.components?.schemas || root.definitions || {}
	const schemas: Record<string, OpenApiSchema> = {}
	for (const [name, val] of Object.entries(raw)) {
		schemas[name] = resolveSchema(root, val)
	}
	return schemas
}

function extractTags(root: any, endpoints: OpenApiEndpoint[]): OpenApiTag[] {
	const explicit: OpenApiTag[] = (root.tags || []).map((t: any) => ({
		name: t.name,
		description: t.description || undefined,
	}))

	const named = new Set(explicit.map((t) => t.name))
	for (const ep of endpoints) {
		for (const tag of ep.tags) {
			if (!named.has(tag)) {
				explicit.push({ name: tag })
				named.add(tag)
			}
		}
	}

	return explicit
}

export function parseOpenApi(spec: string | object): OpenApiSpec {
	const root = typeof spec === "string" ? JSON.parse(spec) : spec

	const endpoints = extractEndpoints(root)

	return {
		info: {
			title: root.info?.title || "",
			version: root.info?.version || "",
			description: root.info?.description || undefined,
		},
		endpoints,
		tags: extractTags(root, endpoints),
		schemas: extractSchemas(root),
	}
}

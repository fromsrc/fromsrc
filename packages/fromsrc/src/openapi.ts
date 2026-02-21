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
import { parsespec, rootschema } from "./openapiguard"

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

type jsonrecord = Record<string, unknown>

function isrecord(value: unknown): value is jsonrecord {
	return typeof value === "object" && value !== null
}

function asrecord(value: unknown): jsonrecord {
	return isrecord(value) ? value : {}
}

function extractParameters(root: unknown, raw: unknown): OpenApiParameter[] {
	if (!Array.isArray(raw)) return []
	return raw.flatMap((item) => {
		const input = asrecord(item)
		const ref = typeof input.$ref === "string" ? resolveRef(root, input.$ref) : input
		const resolved = asrecord(ref)
		const name = typeof resolved.name === "string" ? resolved.name : ""
		const location = resolved.in
		if (!["query", "path", "header", "cookie"].includes(String(location))) return []
		return [{
			name,
			in: location as OpenApiParameter["in"],
			required: typeof resolved.required === "boolean" ? resolved.required : undefined,
			description: typeof resolved.description === "string" ? resolved.description : undefined,
			schema: resolved.schema ? resolveSchema(root, resolved.schema) : undefined,
		}]
	})
}

function extractRequestBody(root: unknown, raw: unknown): OpenApiRequestBody | undefined {
	if (!raw) return undefined
	const input = asrecord(raw)
	const ref = typeof input.$ref === "string" ? resolveRef(root, input.$ref) : input
	const resolved = asrecord(ref)
	return {
		description: typeof resolved.description === "string" ? resolved.description : undefined,
		required: typeof resolved.required === "boolean" ? resolved.required : undefined,
		content: resolveContent(root, resolved.content) ?? {},
	}
}

function extractResponses(root: unknown, raw: unknown): OpenApiResponse[] {
	if (!isrecord(raw)) return []
	const list = Object.entries(raw).map(([status, val]) => {
		const input = asrecord(val)
		const ref = typeof input.$ref === "string" ? resolveRef(root, input.$ref) : input
		const resolved = asrecord(ref)
		return {
			status,
			description: typeof resolved.description === "string" ? resolved.description : undefined,
			content: resolveContent(root, resolved.content),
		}
	})
	const rank = (status: string): number => {
		if (status === "default") return Number.MAX_SAFE_INTEGER
		const numeric = Number(status)
		return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER - 1
	}
	return list.sort((left, right) => rank(left.status) - rank(right.status))
}

function extractSecurity(raw: unknown): string[] | undefined {
	if (!Array.isArray(raw) || raw.length === 0) return undefined
	const names = new Set<string>()
	for (const item of raw) {
		if (!isrecord(item)) continue
		for (const key of Object.keys(item)) {
			names.add(key)
		}
	}
	return Array.from(names)
}

function extractEndpoints(root: unknown): OpenApiEndpoint[] {
	const doc = asrecord(root)
	const paths = asrecord(doc.paths)
	const endpoints: OpenApiEndpoint[] = []

	for (const [path, methodset] of Object.entries(paths)) {
		const methods = asrecord(methodset)
		const shared = methods.parameters

		for (const method of HTTP_METHODS) {
			const op = asrecord(methods[method])
			if (Object.keys(op).length === 0) continue

			const opParams = Array.isArray(op.parameters) ? op.parameters : []
			const sharedParams = Array.isArray(shared) ? shared : []
			const params = [...sharedParams, ...opParams]
			const tags = Array.isArray(op.tags) ? op.tags.filter((item): item is string => typeof item === "string") : []

			endpoints.push({
				method: method.toUpperCase() as OpenApiMethod,
				path,
				operationId: typeof op.operationId === "string" ? op.operationId : undefined,
				summary: typeof op.summary === "string" ? op.summary : undefined,
				description: typeof op.description === "string" ? op.description : undefined,
				tags,
				parameters: extractParameters(root, params),
				requestBody: extractRequestBody(root, op.requestBody),
				responses: extractResponses(root, op.responses),
				deprecated: typeof op.deprecated === "boolean" ? op.deprecated : undefined,
				security: extractSecurity(op.security),
			})
		}
	}

	return endpoints
}

function extractSchemas(root: unknown): Record<string, OpenApiSchema> {
	const parsed = rootschema.parse(root)
	const raw = asrecord(parsed.components?.schemas ?? parsed.definitions)
	const schemas: Record<string, OpenApiSchema> = {}
	for (const [name, val] of Object.entries(raw)) {
		schemas[name] = resolveSchema(root, val)
	}
	return schemas
}

function extractTags(root: unknown, endpoints: OpenApiEndpoint[]): OpenApiTag[] {
	const parsed = rootschema.parse(root)
	const explicit: OpenApiTag[] = parsed.tags

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
	const root = parsespec(spec)
	const parsed = rootschema.parse(root)

	const endpoints = extractEndpoints(root)

	return {
		info: {
			title: parsed.info.title,
			version: parsed.info.version,
			description: parsed.info.description,
		},
		endpoints,
		tags: extractTags(root, endpoints),
		schemas: extractSchemas(root),
	}
}

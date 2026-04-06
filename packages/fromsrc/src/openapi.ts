import { isRecord } from "./guard";
import { parseSpec, rootSchema } from "./openapiguard";
import {
  generateEndpointSlug,
  resolveContent,
  resolveRef,
  resolveSchema,
} from "./openapiutil";
import type {
  OpenApiEndpoint,
  OpenApiMethod,
  OpenApiParameter,
  OpenApiRequestBody,
  OpenApiResponse,
  OpenApiSchema,
  OpenApiSpec,
  OpenApiTag,
} from "./openapiutil";

export type {
  OpenApiEndpoint,
  OpenApiMethod,
  OpenApiParameter,
  OpenApiRequestBody,
  OpenApiResponse,
  OpenApiSchema,
  OpenApiSpec,
  OpenApiTag,
};
export { generateEndpointSlug };

const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "options",
  "trace",
] as const;

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function extractParameters(root: unknown, raw: unknown): OpenApiParameter[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.flatMap((item) => {
    const input = asRecord(item);
    const ref =
      typeof input.$ref === "string" ? resolveRef(root, input.$ref) : input;
    const resolved = asRecord(ref);
    const name = typeof resolved.name === "string" ? resolved.name : "";
    const location = resolved.in;
    if (!["query", "path", "header", "cookie"].includes(String(location))) {
      return [];
    }
    return [
      {
        description:
          typeof resolved.description === "string"
            ? resolved.description
            : undefined,
        in: location as OpenApiParameter["in"],
        name,
        required:
          typeof resolved.required === "boolean"
            ? resolved.required
            : undefined,
        schema: resolved.schema
          ? resolveSchema(root, resolved.schema)
          : undefined,
      },
    ];
  });
}

function extractRequestBody(
  root: unknown,
  raw: unknown
): OpenApiRequestBody | undefined {
  if (!raw) {
    return undefined;
  }
  const input = asRecord(raw);
  const ref =
    typeof input.$ref === "string" ? resolveRef(root, input.$ref) : input;
  const resolved = asRecord(ref);
  return {
    content: resolveContent(root, resolved.content) ?? {},
    description:
      typeof resolved.description === "string"
        ? resolved.description
        : undefined,
    required:
      typeof resolved.required === "boolean" ? resolved.required : undefined,
  };
}

function extractResponses(root: unknown, raw: unknown): OpenApiResponse[] {
  if (!isRecord(raw)) {
    return [];
  }
  const list = Object.entries(raw).map(([status, val]) => {
    const input = asRecord(val);
    const ref =
      typeof input.$ref === "string" ? resolveRef(root, input.$ref) : input;
    const resolved = asRecord(ref);
    return {
      content: resolveContent(root, resolved.content),
      description:
        typeof resolved.description === "string"
          ? resolved.description
          : undefined,
      status,
    };
  });
  const rank = (status: string): number => {
    if (status === "default") {
      return Number.MAX_SAFE_INTEGER;
    }
    const numeric = Number(status);
    return Number.isFinite(numeric) ? numeric : Number.MAX_SAFE_INTEGER - 1;
  };
  return list.sort((left, right) => rank(left.status) - rank(right.status));
}

function extractSecurity(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) {
    return undefined;
  }
  const names = new Set<string>();
  for (const item of raw) {
    if (!isRecord(item)) {
      continue;
    }
    for (const key of Object.keys(item)) {
      names.add(key);
    }
  }
  return [...names];
}

function extractEndpoints(root: unknown): OpenApiEndpoint[] {
  const doc = asRecord(root);
  const paths = asRecord(doc.paths);
  const endpoints: OpenApiEndpoint[] = [];

  for (const [path, methodset] of Object.entries(paths)) {
    const methods = asRecord(methodset);
    const shared = methods.parameters;

    for (const method of HTTP_METHODS) {
      const op = asRecord(methods[method]);
      if (Object.keys(op).length === 0) {
        continue;
      }

      const opParams = Array.isArray(op.parameters) ? op.parameters : [];
      const sharedParams = Array.isArray(shared) ? shared : [];
      const params = [...sharedParams, ...opParams];
      const tags = Array.isArray(op.tags)
        ? op.tags.filter((item): item is string => typeof item === "string")
        : [];

      endpoints.push({
        deprecated:
          typeof op.deprecated === "boolean" ? op.deprecated : undefined,
        description:
          typeof op.description === "string" ? op.description : undefined,
        method: method.toUpperCase() as OpenApiMethod,
        operationId:
          typeof op.operationId === "string" ? op.operationId : undefined,
        parameters: extractParameters(root, params),
        path,
        requestBody: extractRequestBody(root, op.requestBody),
        responses: extractResponses(root, op.responses),
        security: extractSecurity(op.security),
        summary: typeof op.summary === "string" ? op.summary : undefined,
        tags,
      });
    }
  }

  return endpoints;
}

function extractSchemas(root: unknown): Record<string, OpenApiSchema> {
  const parsed = rootSchema.parse(root);
  const raw = asRecord(parsed.components?.schemas ?? parsed.definitions);
  const schemas: Record<string, OpenApiSchema> = {};
  for (const [name, val] of Object.entries(raw)) {
    schemas[name] = resolveSchema(root, val);
  }
  return schemas;
}

function extractTags(
  root: unknown,
  endpoints: OpenApiEndpoint[]
): OpenApiTag[] {
  const parsed = rootSchema.parse(root);
  const explicit: OpenApiTag[] = parsed.tags;

  const named = new Set(explicit.map((t) => t.name));
  for (const ep of endpoints) {
    for (const tag of ep.tags) {
      if (!named.has(tag)) {
        explicit.push({ name: tag });
        named.add(tag);
      }
    }
  }

  return explicit;
}

export function parseOpenApi(spec: string | object): OpenApiSpec {
  const root = parseSpec(spec);
  const parsed = rootSchema.parse(root);

  const endpoints = extractEndpoints(root);

  return {
    endpoints,
    info: {
      description: parsed.info.description,
      title: parsed.info.title,
      version: parsed.info.version,
    },
    schemas: extractSchemas(root),
    tags: extractTags(root, endpoints),
  };
}

import type { OpenApiTag } from "./openapiutil";

type JsonRecord = Record<string, unknown>;

interface RootValue {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, unknown>;
  tags: OpenApiTag[];
  components?: {
    schemas?: Record<string, unknown>;
  };
  definitions?: Record<string, unknown>;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function toText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function parseInfo(value: unknown): RootValue["info"] {
  const input = toRecord(value) ?? {};
  return {
    description: toText(input.description),
    title: toText(input.title) ?? "",
    version: toText(input.version) ?? "",
  };
}

function parseTags(value: unknown): OpenApiTag[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const input = toRecord(item);
    if (!input) {
      return [];
    }
    const name = toText(input.name);
    if (!name || name.length === 0) {
      return [];
    }
    return [{ description: toText(input.description), name }];
  });
}

function parsePaths(value: unknown): Record<string, unknown> {
  return toRecord(value) ?? {};
}

function parseComponents(value: unknown): RootValue["components"] {
  const input = toRecord(value);
  if (!input) {
    return undefined;
  }
  const schemas = toRecord(input.schemas);
  if (!schemas) {
    return undefined;
  }
  return { schemas };
}

function parseDefinitions(value: unknown): RootValue["definitions"] {
  return toRecord(value);
}

function parseRoot(value: unknown): RootValue {
  if (!isRecord(value)) {
    throw new Error("invalid openapi specification");
  }
  return {
    components: parseComponents(value.components),
    definitions: parseDefinitions(value.definitions),
    info: parseInfo(value.info),
    paths: parsePaths(value.paths),
    tags: parseTags(value.tags),
  };
}

export const rootSchema = {
  parse: parseRoot,
};

interface BunCore {
  YAML?: {
    parse: (input: string) => unknown;
  };
}

function parseYaml(spec: string): unknown {
  const runtime = globalThis as typeof globalThis & { Bun?: BunCore };
  const parser = runtime.Bun?.YAML?.parse;
  if (!parser) {
    throw new Error("invalid openapi specification");
  }
  return parser(spec);
}

export function parseSpec(spec: string | object): unknown {
  if (typeof spec === "string") {
    const text = spec.trim();
    if (text.length === 0) {
      throw new Error("invalid openapi specification");
    }
    try {
      return JSON.parse(text);
    } catch {
      try {
        const parsed: unknown = parseYaml(text);
        if (!isRecord(parsed)) {
          throw new Error("invalid openapi specification");
        }
        return parsed;
      } catch {
        throw new Error("invalid openapi specification");
      }
    }
  }
  return spec;
}

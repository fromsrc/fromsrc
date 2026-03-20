import type { z } from "fromsrc";
import { generateMcpManifest } from "fromsrc";

import {
  init,
  list,
  page,
  protocol,
  resource,
  search,
  slug,
  supported,
  toolcall,
} from "./rpc";

interface config {
  name: string;
  version: string;
  baseUrl: string;
}

interface pageitem {
  slug: string;
  title: string;
  description?: string;
}

interface handler {
  search(
    query: string
  ): Promise<{ slug: string; title: string; snippet?: string }[]>;
  getPage(slug: string): Promise<string | null>;
  listPages(): Promise<pageitem[]>;
}

interface core {
  name: z.infer<typeof import("./rpc").methodname>;
  params: unknown;
  config: config;
  handler: handler;
}

interface ok {
  ok: true;
  result: unknown;
  status?: number;
}

interface fail {
  ok: false;
  code: number;
  message: string;
  status: number;
}

function paged<T extends { slug: string }>(
  items: T[],
  input: NonNullable<z.infer<typeof list>>
): { items: T[]; nextCursor?: string } {
  const limit = input.limit ?? 50;
  if (!input.cursor) {
    const slice = items.slice(0, limit);
    const next = items[limit]?.slug;
    return next ? { items: slice, nextCursor: next } : { items: slice };
  }
  const start = items.findIndex((item) => item.slug === input.cursor);
  if (start === -1) {
    return { items: items.slice(0, limit), nextCursor: items[limit]?.slug };
  }
  const from = start + 1;
  const slice = items.slice(from, from + limit);
  const next = items[from + limit]?.slug;
  return next ? { items: slice, nextCursor: next } : { items: slice };
}

function uri(slug: string): string {
  const safe = slug.length > 0 ? slug : "index";
  return `fromsrc://docs/${safe}`;
}

function parseslug(uri: string): string | null {
  const prefix = "fromsrc://docs/";
  if (!uri.startsWith(prefix)) {
    return null;
  }
  const value = uri.slice(prefix.length).replace(/\/+$/, "");
  if (value.length === 0 || value === "index") {
    return "";
  }
  return value;
}

function safeslug(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  return slug.safeParse(value).success ? value : null;
}

function toolresult(
  text: string,
  structured?: Record<string, unknown>
): {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError: boolean;
} {
  return {
    content: [{ text, type: "text" }],
    isError: false,
    structuredContent: structured,
  };
}

export async function execute(core: core): Promise<ok | fail> {
  switch (core.name) {
    case "initialize": {
      const parsed = init.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const selected = supported.has(parsed.data.protocolVersion)
        ? parsed.data.protocolVersion
        : protocol;
      return {
        ok: true,
        result: {
          capabilities: {
            resources: { listChanged: false },
            tools: { listChanged: false },
          },
          protocolVersion: selected,
          serverInfo: { name: core.config.name, version: core.config.version },
        },
      };
    }
    case "notifications/initialized": {
      return { ok: true, result: { ok: true }, status: 202 };
    }
    case "ping": {
      return { ok: true, result: {} };
    }
    case "search_docs": {
      const parsed = search.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      return { ok: true, result: await core.handler.search(parsed.data.query) };
    }
    case "get_page": {
      const parsed = page.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const content = await core.handler.getPage(parsed.data.slug);
      if (!content) {
        return { code: -32004, message: "not found", ok: false, status: 404 };
      }
      return { ok: true, result: { content } };
    }
    case "list_pages": {
      const parsed = list.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const pages = await core.handler.listPages();
      if (!parsed.data) {
        return { ok: true, result: pages };
      }
      return { ok: true, result: paged(pages, parsed.data) };
    }
    case "tools/list": {
      const parsed = list.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const { tools } = generateMcpManifest(core.config);
      if (!parsed.data) {
        return { ok: true, result: { tools } };
      }
      const result = paged(
        tools.map((item) => ({ ...item, slug: item.name })),
        parsed.data
      );
      return {
        ok: true,
        result: {
          nextCursor: result.nextCursor,
          tools: result.items.map(({ slug: _slug, ...tool }) => tool),
        },
      };
    }
    case "tools/call": {
      const parsed = toolcall.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const args = parsed.data.arguments ?? {};
      if (parsed.data.name === "search_docs") {
        const query = search.safeParse(args);
        if (!query.success) {
          return {
            code: -32602,
            message: "invalid params",
            ok: false,
            status: 400,
          };
        }
        const results = await core.handler.search(query.data.query);
        return {
          ok: true,
          result: toolresult(JSON.stringify(results), { results }),
        };
      }
      if (parsed.data.name === "get_page") {
        const target = page.safeParse(args);
        if (!target.success) {
          return {
            code: -32602,
            message: "invalid params",
            ok: false,
            status: 400,
          };
        }
        const content = await core.handler.getPage(target.data.slug);
        if (!content) {
          return { code: -32004, message: "not found", ok: false, status: 404 };
        }
        return { ok: true, result: toolresult(content, { content }) };
      }
      if (parsed.data.name === "list_pages") {
        const listed = list.safeParse(args);
        if (!listed.success) {
          return {
            code: -32602,
            message: "invalid params",
            ok: false,
            status: 400,
          };
        }
        const pages = await core.handler.listPages();
        if (!listed.data) {
          return {
            ok: true,
            result: toolresult(JSON.stringify(pages), { pages }),
          };
        }
        const result = paged(pages, listed.data);
        return { ok: true, result: toolresult(JSON.stringify(result), result) };
      }
      return { code: -32_601, message: "unknown tool", ok: false, status: 400 };
    }
    case "resources/list": {
      const parsed = list.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const pages = await core.handler.listPages();
      const resources = pages.map((item) => ({
        description: item.description,
        mimeType: "text/markdown",
        name: item.title,
        slug: item.slug,
        uri: uri(item.slug),
      }));
      if (!parsed.data) {
        return {
          ok: true,
          result: {
            resources: resources.map(({ slug: _slug, ...item }) => item),
          },
        };
      }
      const result = paged(resources, parsed.data);
      return {
        ok: true,
        result: {
          nextCursor: result.nextCursor,
          resources: result.items.map(({ slug: _slug, ...item }) => item),
        },
      };
    }
    case "resources/templates/list": {
      return {
        ok: true,
        result: {
          resourceTemplates: [
            {
              description: "Docs markdown pages",
              mimeType: "text/markdown",
              name: "docs",
              uriTemplate: "fromsrc://docs/{slug}",
            },
          ],
        },
      };
    }
    case "resources/read": {
      const parsed = resource.safeParse(core.params);
      if (!parsed.success) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const value = safeslug(parseslug(parsed.data.uri));
      if (value === null) {
        return {
          code: -32602,
          message: "invalid params",
          ok: false,
          status: 400,
        };
      }
      const content = await core.handler.getPage(value);
      if (!content) {
        return { code: -32004, message: "not found", ok: false, status: 404 };
      }
      return {
        ok: true,
        result: {
          contents: [
            { mimeType: "text/markdown", text: content, uri: parsed.data.uri },
          ],
        },
      };
    }
    default: {
      return {
        code: -32601,
        message: "unknown method",
        ok: false,
        status: 400,
      };
    }
  }
}

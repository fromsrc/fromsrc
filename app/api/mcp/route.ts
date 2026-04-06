import { createMcpHandler, generateMcpManifest, z } from "fromsrc";
import type { ContentSource } from "fromsrc";

import { siteUrl } from "@/app/_lib/site";
import { sendjson } from "@/app/api/_lib/json";
import { getAllDocs, getDoc, getSearchDocs } from "@/app/docs/_lib/content";

import { execute } from "./ops";
import { method, rpcmethod } from "./rpc";

const config = {
  baseUrl: siteUrl(),
  name: "fromsrc",
  version: "1.0.0",
};

const source: ContentSource = {
  async get(slug) {
    const doc = await getDoc(slug);
    if (!doc) {
      return null;
    }
    return { content: doc.content, data: doc.data };
  },
  list() {
    return getAllDocs();
  },
  search() {
    return getSearchDocs();
  },
};

const handler = createMcpHandler(config, source);
const legacybody = z.object({
  method: method.shape.method,
  params: z.unknown().optional(),
});
const cors = {
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};
const cachecontrol =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

function sendrpc(
  rpc: z.SafeParseReturnType<unknown, z.infer<typeof rpcmethod>>,
  id: z.infer<typeof rpcmethod>["id"],
  result: unknown,
  status = 200
): Response {
  if (!rpc.success) {
    return Response.json(result, { headers: cors, status });
  }
  if (id === undefined) {
    return new Response(null, { headers: cors, status: 202 });
  }
  return Response.json(
    { id, jsonrpc: "2.0", result },
    { headers: cors, status }
  );
}

function senderror(
  rpc: z.SafeParseReturnType<unknown, z.infer<typeof rpcmethod>>,
  id: z.infer<typeof rpcmethod>["id"],
  code: number,
  message: string,
  status = 400
): Response {
  if (!rpc.success) {
    return Response.json({ error: message }, { headers: cors, status });
  }
  return Response.json(
    { error: { code, message }, id: id ?? null, jsonrpc: "2.0" },
    { headers: cors, status }
  );
}

export function OPTIONS() {
  return new Response(null, { headers: cors, status: 204 });
}

export function GET(request: Request) {
  const manifest = generateMcpManifest(config);
  const response = sendjson(request, manifest, cachecontrol);
  for (const [key, value] of Object.entries(cors)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "invalid json" },
      { headers: cors, status: 400 }
    );
  }

  const rpc = rpcmethod.safeParse(body);
  const id = rpc.success ? rpc.data.id : undefined;
  let name: z.infer<typeof method>["method"];
  let params: unknown;

  if (rpc.success) {
    name = rpc.data.method;
    ({ params } = rpc.data);
  } else {
    const legacy = legacybody.safeParse(body);
    if (!legacy.success) {
      return Response.json(
        { error: "invalid method" },
        { headers: cors, status: 400 }
      );
    }
    name = legacy.data.method;
    ({ params } = legacy.data);
  }

  const result = await execute({ config, handler, name, params });
  if (!result.ok) {
    return senderror(rpc, id, result.code, result.message, result.status);
  }
  return sendrpc(rpc, id, result.result, result.status ?? 200);
}

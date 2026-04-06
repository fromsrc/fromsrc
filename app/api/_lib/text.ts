import { createHash } from "node:crypto";

const type = "text/plain; charset=utf-8";
const markdownType = "text/markdown; charset=utf-8";

export function token(content: string): string {
  return `"${createHash("sha256").update(content).digest("base64url")}"`;
}

function respond(
  request: Request,
  content: string,
  cache: string,
  contentType: string,
  status = 200
): Response {
  const etag = token(content);
  const headers = new Headers({
    "Cache-Control": cache,
    "Content-Type": contentType,
    ETag: etag,
    "X-Content-Type-Options": "nosniff",
  });
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { headers, status: 304 });
  }
  return new Response(content, { headers, status });
}

export function send(
  request: Request,
  content: string,
  cache: string,
  status = 200
): Response {
  return respond(request, content, cache, type, status);
}

export function sendMarkdown(
  request: Request,
  content: string,
  cache: string,
  status = 200
): Response {
  return respond(request, content, cache, markdownType, status);
}

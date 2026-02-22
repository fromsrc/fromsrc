import { createHash } from "node:crypto"

const type = "text/plain; charset=utf-8"
const markdowntype = "text/markdown; charset=utf-8"

export function token(content: string): string {
	return `"${createHash("sha256").update(content).digest("base64url")}"`
}

function respond(request: Request, content: string, cache: string, contenttype: string, status = 200): Response {
	const etag = token(content)
	const headers = new Headers({
		"Content-Type": contenttype,
		"Cache-Control": cache,
		"ETag": etag,
		"X-Content-Type-Options": "nosniff",
	})
	if (request.headers.get("if-none-match") === etag) {
		return new Response(null, { status: 304, headers })
	}
	return new Response(content, { status, headers })
}

export function send(request: Request, content: string, cache: string, status = 200): Response {
	return respond(request, content, cache, type, status)
}

export function sendmarkdown(request: Request, content: string, cache: string, status = 200): Response {
	return respond(request, content, cache, markdowntype, status)
}

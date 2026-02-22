import { createHash } from "node:crypto"

const type = "application/json; charset=utf-8"

type jsonprimitive = string | number | boolean | null
type jsonify<T> = T extends jsonprimitive
	? T
	: T extends undefined
		? undefined
		: T extends (...args: never[]) => unknown
			? never
			: T extends readonly (infer U)[]
				? jsonify<U>[]
				: T extends object
					? { [K in keyof T]: jsonify<T[K]> }
					: never

function token(content: string): string {
	return `"${createHash("sha256").update(content).digest("base64url")}"`
}

export function sendjson<T>(request: Request, value: jsonify<T>, cache: string, status = 200): Response {
	const content = JSON.stringify(value)
	const etag = token(content)
	const headers = new Headers({
		"Content-Type": type,
		"Cache-Control": cache,
		"ETag": etag,
		"X-Content-Type-Options": "nosniff",
	})
	if (request.headers.get("if-none-match") === etag) {
		return new Response(null, { status: 304, headers })
	}
	return new Response(content, { status, headers })
}

export function sendjsonwithheaders<T>(
	request: Request,
	value: jsonify<T>,
	cache: string,
	extra: HeadersInit,
	status = 200,
): Response {
	const response = sendjson(request, value, cache, status)
	for (const [key, val] of new Headers(extra).entries()) {
		response.headers.set(key, val)
	}
	return response
}

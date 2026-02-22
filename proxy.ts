import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

function value(raw: string): number {
	const input = raw.trim()
	if (input.length === 0) return 1
	const parsed = Number(input)
	if (!Number.isFinite(parsed)) return 0
	if (parsed < 0) return 0
	if (parsed > 1) return 1
	return parsed
}

function weight(entry: string): number {
	const parts = entry.split(";")
	for (const item of parts.slice(1)) {
		const [key, raw] = item.split("=")
		if ((key ?? "").trim().toLowerCase() === "q") return value(raw ?? "")
	}
	return 1
}

function markdown(accept: string): boolean {
	let md = 0
	let html = 0
	for (const item of accept.split(",")) {
		const type = (item.split(";", 1).at(0) ?? "").trim().toLowerCase()
		const score = weight(item)
		if (score <= 0) continue
		if (type === "text/markdown" || type === "text/x-markdown") md = Math.max(md, score)
		if (type === "text/html") html = Math.max(html, score)
	}
	return md > 0 && md >= html
}

function rawslug(path: string): string | null {
	if (path === "/docs.md") return "index"
	if (!path.startsWith("/docs/") || !path.endsWith(".md")) return null
	const slug = path.slice("/docs/".length, -".md".length).replace(/\/+$/, "")
	return slug.length > 0 ? slug : "index"
}

function docslug(path: string): string | null {
	if (path === "/docs" || path === "/docs/") return "index"
	if (!path.startsWith("/docs/")) return null
	const slug = path.slice("/docs/".length).replace(/\/+$/, "")
	return slug.length > 0 ? slug : "index"
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl
	const accept = request.headers.get("accept") || ""
	const raw = rawslug(pathname)

	if (raw) {
		return NextResponse.rewrite(new URL(`/api/raw/${raw}`, request.url))
	}

	const slug = docslug(pathname)
	if (slug && markdown(accept)) {
		return NextResponse.rewrite(new URL(`/api/raw/${slug}`, request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ["/docs", "/docs/:path*", "/docs.md"],
}

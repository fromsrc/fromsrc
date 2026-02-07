import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl
	const accept = request.headers.get("accept") || ""

	if (pathname.startsWith("/docs/") && pathname.endsWith(".md")) {
		const slug = pathname.replace("/docs/", "").replace(".md", "")
		return NextResponse.rewrite(new URL(`/api/raw/${slug}`, request.url))
	}

	if (pathname.startsWith("/docs/") && accept.includes("text/markdown")) {
		const slug = pathname.replace("/docs/", "").replace(/\/$/, "") || "index"
		return NextResponse.rewrite(new URL(`/api/raw/${slug}`, request.url))
	}

	return NextResponse.next()
}

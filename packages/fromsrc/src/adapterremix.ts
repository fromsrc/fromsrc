"use client"

import { type ReactNode, createElement } from "react"
import { Link as RemixLink, useLocation, useNavigate } from "@remix-run/react"
import type { FrameworkAdapter } from "./adapter"

function Link({
	href,
	children,
	prefetch,
}: { href: string; children: ReactNode; prefetch?: boolean }) {
	return createElement(RemixLink, { to: href, prefetch: prefetch ? "intent" : "none" }, children)
}

function Image({
	src,
	alt,
	width,
	height,
}: { src: string; alt: string; width?: number; height?: number }) {
	return createElement("img", { src, alt, width, height })
}

function useRemixPathname(): string {
	return useLocation().pathname
}

function useRemixRouter() {
	const navigate = useNavigate()
	return {
		push: (url: string) => navigate(url),
		back: () => navigate(-1),
	}
}

export const remixAdapter: FrameworkAdapter = {
	Link,
	Image,
	usePathname: useRemixPathname,
	useRouter: useRemixRouter,
}

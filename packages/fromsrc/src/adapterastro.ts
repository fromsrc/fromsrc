"use client"

import { type ReactNode, createElement } from "react"
import { back, push, usepath } from "./browser"
import type { FrameworkAdapter } from "./adapter"

function Link({
	href,
	children,
}: { href: string; children: ReactNode; prefetch?: boolean }) {
	return createElement("a", { href }, children)
}

function Image({
	src,
	alt,
	width,
	height,
}: { src: string; alt: string; width?: number; height?: number }) {
	return createElement("img", { src, alt, width, height })
}

function useAstroPathname(): string {
	return usepath()
}

function useAstroRouter() {
	return {
		push,
		back,
	}
}

export const astroAdapter: FrameworkAdapter = {
	Link,
	Image,
	usePathname: useAstroPathname,
	useRouter: useAstroRouter,
}

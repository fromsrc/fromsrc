"use client"

import { type ReactNode, createElement } from "react"
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

function useVitePathname(): string {
	if (typeof window === "undefined") {
		return "/"
	}
	return window.location.pathname
}

function useViteRouter() {
	return {
		push: (url: string) => {
			if (typeof window === "undefined") {
				return
			}
			window.history.pushState({}, "", url)
			window.dispatchEvent(new PopStateEvent("popstate"))
		},
		back: () => {
			if (typeof window === "undefined") {
				return
			}
			window.history.back()
		},
	}
}

export const viteAdapter: FrameworkAdapter = {
	Link,
	Image,
	usePathname: useVitePathname,
	useRouter: useViteRouter,
}

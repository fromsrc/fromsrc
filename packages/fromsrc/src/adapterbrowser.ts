"use client"

import { type ReactNode, createElement } from "react"
import type { FrameworkAdapter } from "./adapter"
import { back, push, usepath } from "./browser"

function link({
	href,
	children,
}: { href: string; children: ReactNode; prefetch?: boolean }) {
	return createElement("a", { href }, children)
}

function image({
	src,
	alt,
	width,
	height,
}: { src: string; alt: string; width?: number; height?: number }) {
	return createElement("img", { src, alt, width, height })
}

function pathname(): string {
	return usepath()
}

function router() {
	return {
		push,
		back,
	}
}

export function createbrowseradapter(): FrameworkAdapter {
	return {
		Link: link,
		Image: image,
		usePathname: pathname,
		useRouter: router,
	}
}

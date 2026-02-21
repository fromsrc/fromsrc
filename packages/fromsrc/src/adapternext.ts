"use client"

import NextImage from "next/image"
import NextLink from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { type ReactNode, createElement } from "react"
import type { FrameworkAdapter } from "./adapter"

function Link({
	href,
	children,
	prefetch,
}: { href: string; children: ReactNode; prefetch?: boolean }) {
	return createElement(NextLink, { href, prefetch }, children)
}

function Image({
	src,
	alt,
	width,
	height,
}: { src: string; alt: string; width?: number; height?: number }) {
	if (typeof width === "number" && typeof height === "number") {
		return createElement(NextImage, { src, alt, width, height })
	}
	return createElement("img", { src, alt, width, height })
}

function useNextPathname(): string {
	return usePathname()
}

function useNextRouter() {
	const router = useRouter()
	return {
		push: (url: string) => router.push(url),
		back: () => router.back(),
	}
}

export const nextAdapter: FrameworkAdapter = {
	Link,
	Image,
	usePathname: useNextPathname,
	useRouter: useNextRouter,
}

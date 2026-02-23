"use client"

import NextImage from "next/image"
import NextLink from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createElement } from "react"
import type { FrameworkAdapter, fromsrcimageprops, fromsrclinkprops } from "./adapter"

function Link({
	href,
	children,
	prefetch,
	...rest
}: fromsrclinkprops) {
	return createElement(NextLink, { href, prefetch, ...rest }, children)
}

function Image({
	src,
	alt,
	width,
	height,
	...rest
}: fromsrcimageprops) {
	const nextWidth = Number(width) > 0 ? Number(width) : 1200
	const nextHeight = Number(height) > 0 ? Number(height) : 630
	return createElement(NextImage, {
		src,
		alt,
		width: nextWidth,
		height: nextHeight,
		...rest,
	})
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

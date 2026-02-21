"use client"

import { createElement } from "react"
import { Link as RemixLink, useLocation, useNavigate } from "@remix-run/react"
import type { FrameworkAdapter, fromsrcimageprops, fromsrclinkprops } from "./adapter"

function Link({
	href,
	children,
	prefetch,
	...rest
}: fromsrclinkprops) {
	return createElement(
		RemixLink,
		{ to: href, prefetch: prefetch ? "intent" : "none", ...rest },
		children,
	)
}

function Image({
	src,
	alt,
	...rest
}: fromsrcimageprops) {
	return createElement("img", { src, alt, ...rest })
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

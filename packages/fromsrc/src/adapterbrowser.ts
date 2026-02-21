"use client"

import { createElement } from "react"
import type { FrameworkAdapter, fromsrcimageprops, fromsrclinkprops } from "./adapter"
import { back, push, usepath } from "./browser"

function link({
	href,
	children,
	prefetch: _prefetch,
	...rest
}: fromsrclinkprops) {
	return createElement("a", { href, ...rest }, children)
}

function image({
	src,
	alt,
	...rest
}: fromsrcimageprops) {
	return createElement("img", { src, alt, ...rest })
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

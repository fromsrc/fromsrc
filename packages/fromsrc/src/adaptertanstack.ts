"use client"

import { createElement } from "react"
import {
	Link as RouterLink,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router"
import type { FrameworkAdapter, fromsrcimageprops, fromsrclinkprops } from "./adapter"

function Link({
	href,
	children,
	prefetch: _prefetch,
	...rest
}: fromsrclinkprops) {
	return createElement(RouterLink, { to: href, ...rest }, children)
}

function Image({
	src,
	alt,
	...rest
}: fromsrcimageprops) {
	return createElement("img", { src, alt, ...rest })
}

function useTanstackPathname(): string {
	return useRouterState({ select: (state) => state.location.pathname })
}

function useTanstackRouter() {
	const navigate = useNavigate()
	return {
		push: (url: string) => navigate({ to: url }),
		back: () => window.history.back(),
	}
}

export const tanstackAdapter: FrameworkAdapter = {
	Link,
	Image,
	usePathname: useTanstackPathname,
	useRouter: useTanstackRouter,
}

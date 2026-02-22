"use client"

import {
	createElement,
} from "react"
import {
	Link as RouterLink,
	useLocation,
	useNavigate,
} from "react-router"
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

function useRouterPathname(): string {
	return useLocation().pathname
}

function useRouterNavigation() {
	const navigate = useNavigate()
	return {
		push: (url: string) => navigate(url),
		back: () => navigate(-1),
	}
}

export const reactRouterAdapter: FrameworkAdapter = {
	Link,
	Image,
	usePathname: useRouterPathname,
	useRouter: useRouterNavigation,
}

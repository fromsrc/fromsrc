"use client"

import {
	type ReactNode,
	createElement,
} from "react"
import {
	Link as RouterLink,
	useLocation,
	useNavigate,
} from "react-router-dom"
import type { FrameworkAdapter } from "./adapter"

function Link({
	href,
	children,
}: { href: string; children: ReactNode; prefetch?: boolean }) {
	return createElement(RouterLink, { to: href }, children)
}

function Image({
	src,
	alt,
	width,
	height,
}: { src: string; alt: string; width?: number; height?: number }) {
	return createElement("img", { src, alt, width, height })
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

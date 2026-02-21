"use client"

import { type ReactNode, createElement } from "react"
import {
	Link as RouterLink,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router"
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

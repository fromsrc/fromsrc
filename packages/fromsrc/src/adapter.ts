"use client"

import {
	type ComponentType,
	type ReactNode,
	createContext,
	createElement,
	useContext,
} from "react"

export interface FrameworkAdapter {
	Link: ComponentType<{ href: string; children: ReactNode; prefetch?: boolean }>
	Image?: ComponentType<{ src: string; alt: string; width?: number; height?: number }>
	usePathname: () => string
	useRouter: () => { push: (url: string) => void; back: () => void }
	compileMdx?: (source: string, options?: any) => Promise<any>
}

function defaultLink({
	href,
	children,
}: { href: string; children: ReactNode }) {
	return createElement("a", { href }, children)
}

function defaultImage({
	src,
	alt,
	width,
	height,
}: { src: string; alt: string; width?: number; height?: number }) {
	return createElement("img", { src, alt, width, height })
}

function defaultUsePathname(): string {
	if (typeof window !== "undefined") {
		return window.location.pathname
	}
	return "/"
}

function defaultUseRouter() {
	return {
		push: (url: string) => {
			if (typeof window !== "undefined") {
				window.location.href = url
			}
		},
		back: () => {
			if (typeof window !== "undefined") {
				window.history.back()
			}
		},
	}
}

export const defaultAdapter: FrameworkAdapter = {
	Link: defaultLink,
	Image: defaultImage,
	usePathname: defaultUsePathname,
	useRouter: defaultUseRouter,
}

export function createadapter(
	adapter: Partial<FrameworkAdapter>,
): FrameworkAdapter {
	return {
		...defaultAdapter,
		...adapter,
	}
}

export const AdapterContext = createContext<FrameworkAdapter>(defaultAdapter)

export function AdapterProvider({
	adapter,
	children,
}: { adapter: FrameworkAdapter; children: ReactNode }) {
	return createElement(AdapterContext.Provider, { value: adapter }, children)
}

export function useAdapter(): FrameworkAdapter {
	return useContext(AdapterContext)
}

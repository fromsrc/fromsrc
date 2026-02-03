"use client"

import { useMemo } from "react"
import type { DocMeta } from "../content"
import type { SidebarFolder, SidebarItem, SidebarSection } from "../components/sidebar"

export interface PageLink {
	href: string
	title: string
}

export interface PaginationResult {
	prev: PageLink | null
	next: PageLink | null
	pages: PageLink[]
	index: number
}

const cache = new Map<string, PageLink[]>()

function flatten(
	sections: SidebarSection[],
	basePath: string,
): PageLink[] {
	const key = JSON.stringify({ sections, basePath })
	const cached = cache.get(key)
	if (cached) return cached

	const pages: PageLink[] = []

	function walk(items: (SidebarItem | SidebarFolder | DocMeta)[]) {
		for (const item of items) {
			if (!("type" in item)) {
				pages.push({
					href: item.slug ? `${basePath}/${item.slug}` : basePath,
					title: item.title,
				})
			} else if (item.type === "item") {
				pages.push({
					href: item.href,
					title: item.title,
				})
			} else if (item.type === "folder") {
				if (item.href) {
					pages.push({
						href: item.href,
						title: item.title,
					})
				}
				walk(item.items)
			}
		}
	}

	for (const section of sections) {
		walk(section.items)
	}

	cache.set(key, pages)
	return pages
}

/**
 * Flattens navigation tree to linear list for prev/next page navigation
 */
export function usePagination(
	navigation: SidebarSection[],
	pathname: string,
	basePath = "/docs",
): PaginationResult {
	return useMemo(() => {
		const pages = flatten(navigation, basePath)
		const index = pages.findIndex((p) => p.href === pathname)

		const prev = index > 0 ? pages[index - 1] ?? null : null
		const next = index >= 0 && index < pages.length - 1 ? pages[index + 1] ?? null : null

		return { prev, next, pages, index }
	}, [navigation, pathname, basePath])
}

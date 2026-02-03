import { readFile } from "node:fs/promises"
import { join } from "node:path"

export interface MetaFile {
	title?: string
	icon?: string
	pages?: string[]
}

export interface PageTreeItem {
	type: "page" | "folder" | "separator"
	slug?: string
	title: string
	icon?: string
	children?: PageTreeItem[]
}

const metaCache = new Map<string, MetaFile | null>()

function isMetaFile(data: unknown): data is MetaFile {
	if (typeof data !== "object" || data === null) return false
	const obj = data as Record<string, unknown>
	if (obj.title !== undefined && typeof obj.title !== "string") return false
	if (obj.icon !== undefined && typeof obj.icon !== "string") return false
	if (obj.pages !== undefined && !Array.isArray(obj.pages)) return false
	if (Array.isArray(obj.pages) && !obj.pages.every((p) => typeof p === "string")) return false
	return true
}

export async function loadMeta(dir: string): Promise<MetaFile | null> {
	const cached = metaCache.get(dir)
	if (cached !== undefined) return cached

	const filepath = join(dir, "_meta.json")

	try {
		const content = await readFile(filepath, "utf-8")
		const data: unknown = JSON.parse(content)
		if (!isMetaFile(data)) {
			metaCache.set(dir, null)
			return null
		}
		metaCache.set(dir, data)
		return data
	} catch {
		metaCache.set(dir, null)
		return null
	}
}

export function sortByMeta<T extends { slug: string }>(
	items: T[],
	pages: string[] | undefined,
	prefix: string,
): T[] {
	if (!pages || pages.length === 0) {
		return items
	}

	const order = new Map<string, number>()
	pages.forEach((page, i) => {
		if (!page.startsWith("---")) {
			order.set(page, i)
		}
	})

	return [...items].sort((a, b) => {
		const aName = getBasename(a.slug, prefix)
		const bName = getBasename(b.slug, prefix)
		const aOrder = order.get(aName) ?? 999
		const bOrder = order.get(bName) ?? 999
		return aOrder - bOrder
	})
}

function getBasename(slug: string, prefix: string): string {
	const relative = prefix ? slug.replace(prefix, "") : slug
	const parts = relative.split("/")
	return parts[0] || "index"
}

export function clearMetaCache() {
	metaCache.clear()
}

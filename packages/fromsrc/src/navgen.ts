import { readdir, readFile } from "node:fs/promises"
import { basename, extname, join, relative } from "node:path"

export type NavItem = { title: string; path: string; children?: NavItem[]; order?: number; icon?: string }
export type NavConfig = { dir: string; extensions?: string[]; orderFile?: string; titleFromFile?: boolean }
export type NavTree = { items: NavItem[]; flat: NavItem[] }
export type SidebarItem = { title: string; href: string; icon?: string; items?: SidebarItem[] }

function titleize(s: string): string {
	return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

type metaentry = { title?: string; order?: number; icon?: string }

function isrecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null
}

function ismetaentry(value: unknown): value is metaentry {
	if (!isrecord(value)) return false
	const title = value.title
	const order = value.order
	const icon = value.icon
	if (title !== undefined && typeof title !== "string") return false
	if (order !== undefined && typeof order !== "number") return false
	if (icon !== undefined && typeof icon !== "string") return false
	return true
}

function parsejson(raw: string): unknown {
	try {
		return JSON.parse(raw)
	} catch {
		return null
	}
}

function parsemetats(raw: string): unknown {
	const match = raw.match(/export\s+default\s+({[\s\S]*})/)
	if (!match) return null
	const body = match[1]
	return body ? parsejson(body) : null
}

async function readMeta(dir: string): Promise<Record<string, string | metaentry>> {
	for (const name of ["_meta.json", "_meta.ts"]) {
		try {
			const raw = await readFile(join(dir, name), "utf-8")
			const parsed = name.endsWith(".json") ? parsejson(raw) : parsemetats(raw)
			if (!isrecord(parsed)) return {}
			const result: Record<string, string | metaentry> = {}
			for (const [key, value] of Object.entries(parsed)) {
				if (typeof value === "string" || ismetaentry(value)) {
					result[key] = value
				}
			}
			return result
		} catch {}
	}
	return {}
}

async function extractTitle(file: string): Promise<string | null> {
	try {
		const m = (await readFile(file, "utf-8")).match(/^#\s+(.+)$/m)
		const title = m?.[1]
		return title ? title.trim() : null
	} catch { return null }
}

function resolveMeta(meta: Record<string, string | metaentry>, key: string, fallback: string) {
	const e = meta[key]
	const title = typeof e === "string" ? e : e?.title ?? fallback
	const order = typeof e === "string" ? undefined : e?.order
	const icon = typeof e === "string" ? undefined : e?.icon
	return { title, order, icon }
}

async function scanDir(dir: string, root: string, exts: string[], h1: boolean): Promise<NavItem[]> {
	const entries = await readdir(dir, { withFileTypes: true })
	const meta = await readMeta(dir)
	const items: NavItem[] = []
	for (const entry of entries) {
		if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue
		const full = join(dir, entry.name)
		const rel = relative(root, full).replace(/\\/g, "/")
		if (entry.isDirectory()) {
			const children = await scanDir(full, root, exts, h1)
			const idx = children.find((c) => basename(c.path).startsWith("index"))
			const r = resolveMeta(meta, entry.name, idx?.title ?? titleize(entry.name))
			items.push({
				...r, path: "/" + rel,
				children: children.filter((c) => !basename(c.path).startsWith("index")),
			})
			continue
		}
		const ext = extname(entry.name)
		if (!exts.includes(ext)) continue
		const slug = rel.replace(new RegExp(`${ext}$`), "")
		const r = resolveMeta(meta, basename(entry.name, ext), titleize(basename(entry.name, ext)))
		if (h1) { const t = await extractTitle(full); if (t) r.title = t }
		items.push({ ...r, path: "/" + slug })
	}
	return sortNav(items)
}

export async function generateNav(config: NavConfig): Promise<NavTree> {
	const exts = config.extensions ?? [".mdx", ".md"]
	const items = await scanDir(config.dir, config.dir, exts, config.titleFromFile ?? false)
	return { items, flat: flattenNav(items) }
}

export function sortNav(items: NavItem[]): NavItem[] {
	return [...items]
		.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title))
		.map((i) => (i.children ? { ...i, children: sortNav(i.children) } : i))
}

export function flattenNav(items: NavItem[]): NavItem[] {
	const r: NavItem[] = []
	for (const i of items) { r.push(i); if (i.children) r.push(...flattenNav(i.children)) }
	return r
}

export function findNavItem(items: NavItem[], path: string): NavItem | undefined {
	for (const i of items) {
		if (i.path === path) return i
		if (i.children) { const f = findNavItem(i.children, path); if (f) return f }
	}
	return undefined
}

export function navToSidebar(items: NavItem[]): SidebarItem[] {
	return items.map((i) => ({
		title: i.title, href: i.path, icon: i.icon,
		...(i.children?.length ? { items: navToSidebar(i.children) } : {}),
	}))
}

export function breadcrumbFromPath(items: NavItem[], path: string): NavItem[] {
	function walk(cur: NavItem[], trail: NavItem[]): NavItem[] | null {
		for (const i of cur) {
			const next = [...trail, i]
			if (i.path === path) return next
			if (i.children) { const f = walk(i.children, next); if (f) return f }
		}
		return null
	}
	return walk(items, []) ?? []
}

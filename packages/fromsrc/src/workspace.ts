import { readdir, readFile, stat } from "node:fs/promises"
import { basename, join, resolve } from "node:path"

export interface WorkspacePackage {
	name: string
	path: string
	docsDir: string
	slug: string
}

export interface WorkspaceConfig {
	root: string
	packages: string[]
	docsDir?: string
}

export interface WorkspaceResult {
	packages: WorkspacePackage[]
	navigation: WorkspaceNavItem[]
}

export interface WorkspaceNavItem {
	label: string
	slug: string
	children?: WorkspaceNavItem[]
}

type jsonrecord = Record<string, unknown>

function isrecord(value: unknown): value is jsonrecord {
	return typeof value === "object" && value !== null
}

function parsename(raw: string): string | null {
	try {
		const parsed: unknown = JSON.parse(raw)
		if (!isrecord(parsed)) return null
		const name = parsed.name
		return typeof name === "string" && name.length > 0 ? name : null
	} catch {
		return null
	}
}

async function matchGlob(root: string, pattern: string): Promise<string[]> {
	const parts = pattern.split("/")
	let dirs = [root]

	for (const part of parts) {
		const next: string[] = []
		for (const dir of dirs) {
			if (part === "*") {
				const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
				for (const e of entries) {
					if (e.isDirectory() && !e.name.startsWith(".")) {
						next.push(join(dir, e.name))
					}
				}
			} else {
				const full = join(dir, part)
				const s = await stat(full).catch(() => null)
				if (s?.isDirectory()) next.push(full)
			}
		}
		dirs = next
	}

	return dirs
}

export async function discoverPackages(config: WorkspaceConfig): Promise<WorkspacePackage[]> {
	const docsDir = config.docsDir ?? "docs"
	const root = resolve(config.root)
	const results: WorkspacePackage[] = []

	for (const pattern of config.packages) {
		const dirs = await matchGlob(root, pattern)
		for (const dir of dirs) {
			const pkgPath = join(dir, "package.json")
			const raw = await readFile(pkgPath, "utf-8").catch(() => null)
			if (!raw) continue
			const name = parsename(raw) ?? basename(dir)
			const docs = join(dir, docsDir)
			const exists = await stat(docs).catch(() => null)
			if (!exists?.isDirectory()) continue
			results.push({ name, path: dir, docsDir: docs, slug: basename(dir) })
		}
	}

	return results
}

export function buildWorkspaceNav(packages: WorkspacePackage[]): WorkspaceNavItem[] {
	return packages.map((pkg) => ({
		label: pkg.name,
		slug: pkg.slug,
		children: [],
	}))
}

export function resolveWorkspacePath(packages: WorkspacePackage[], slug: string): string | null {
	const [pkgSlug, ...rest] = slug.split("/")
	const pkg = packages.find((p) => p.slug === pkgSlug)
	if (!pkg) return null
	const file = rest.length > 0 ? rest.join("/") : "index"
	return join(pkg.docsDir, `${file}.mdx`)
}

export function mergeNavigation(sections: WorkspaceNavItem[][]): WorkspaceNavItem[] {
	const merged: WorkspaceNavItem[] = []
	for (const section of sections) {
		for (const item of section) merged.push(item)
	}
	return merged
}

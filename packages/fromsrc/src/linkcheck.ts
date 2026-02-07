import { readFile, readdir, access } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"

export type LinkCheckResult = {
	source: string
	href: string
	type: "internal" | "anchor" | "external"
	status: "ok" | "broken" | "unknown"
}

export type LinkCheckConfig = {
	dir: string
	extensions?: string[]
	baseUrl?: string
}

export type LinkCheckReport = {
	total: number
	broken: number
	results: LinkCheckResult[]
}

export function isInternalLink(href: string): boolean {
	if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
		return false
	}
	return href.startsWith("/") || href.startsWith("./") || href.startsWith("../") || href.startsWith("#")
}

export function resolveLink(source: string, href: string): string {
	if (href.startsWith("/")) return href
	return resolve(dirname(source), href)
}

export function extractLinks(
	content: string,
	source: string,
): { href: string; type: "internal" | "anchor" | "external" }[] {
	const results: { href: string; type: "internal" | "anchor" | "external" }[] = []
	const seen = new Set<string>()
	const inline = /\[([^\]]*)\]\(([^)]+)\)/g
	const reference = /\[([^\]]*)\]\[([^\]]+)\]/g

	for (const m of content.matchAll(inline)) {
		const href = m[2]!.split(/\s/)[0]!
		if (!seen.has(href)) {
			seen.add(href)
			results.push({ href, type: linktype(href) })
		}
	}

	for (const m of content.matchAll(reference)) {
		const ref = m[2]!
		const pattern = new RegExp(`\\[${ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]:\\s*(.+)`)
		const def = content.match(pattern)
		if (def) {
			const href = def[1]!.trim()
			if (!seen.has(href)) {
				seen.add(href)
				results.push({ href, type: linktype(href) })
			}
		}
	}

	return results
}

function linktype(href: string): "internal" | "anchor" | "external" {
	if (href.startsWith("#")) return "anchor"
	if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) {
		return "external"
	}
	return "internal"
}

async function exists(filepath: string): Promise<boolean> {
	try {
		await access(filepath)
		return true
	} catch {
		return false
	}
}

async function gather(dir: string, exts: string[]): Promise<string[]> {
	const files: string[] = []
	const entries = await readdir(dir, { withFileTypes: true })
	for (const entry of entries) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) {
			files.push(...(await gather(full, exts)))
		} else if (exts.some((e) => entry.name.endsWith(e))) {
			files.push(full)
		}
	}
	return files
}

export async function checkInternalLinks(config: LinkCheckConfig): Promise<LinkCheckReport> {
	const exts = config.extensions ?? [".md", ".mdx"]
	const files = await gather(config.dir, exts)
	const results: LinkCheckResult[] = []

	for (const filepath of files) {
		const content = await readFile(filepath, "utf-8")
		const links = extractLinks(content, filepath)

		for (const link of links) {
			if (link.type === "external") {
				results.push({ source: filepath, href: link.href, type: "external", status: "unknown" })
				continue
			}
			if (link.type === "anchor") {
				const slug = link.href.slice(1)
				const heading = new RegExp(`^#{1,6}\\s+.*${slug.replace(/-/g, "[\\s-]")}`, "im")
				const status = heading.test(content) ? "ok" : "broken"
				results.push({ source: filepath, href: link.href, type: "anchor", status })
				continue
			}
			const clean = link.href.split("#")[0]!.split("?")[0]!
			const resolved = resolveLink(filepath, clean)
			const found =
				(await exists(resolved)) ||
				(await exists(`${resolved}.md`)) ||
				(await exists(`${resolved}.mdx`)) ||
				(await exists(join(resolved, "index.md"))) ||
				(await exists(join(resolved, "index.mdx")))
			results.push({ source: filepath, href: link.href, type: "internal", status: found ? "ok" : "broken" })
		}
	}

	return { total: results.length, broken: results.filter((r) => r.status === "broken").length, results }
}

export function formatReport(report: LinkCheckReport): string {
	const lines = [`${report.total} links, ${report.broken} broken`]
	for (const r of report.results.filter((r) => r.status === "broken")) {
		lines.push(`  ${r.type} ${r.source}: ${r.href}`)
	}
	return lines.join("\n")
}

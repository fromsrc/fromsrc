export interface ChangelogItem {
	type: "added" | "changed" | "fixed" | "removed" | "deprecated" | "security"
	description: string
}

export interface ChangelogEntry {
	version: string
	date: string
	title?: string
	description: string
	type: "major" | "minor" | "patch" | "prerelease"
	breaking?: boolean
	items: ChangelogItem[]
}

export interface ChangelogConfig {
	file?: string
}

const sectionMap: Record<string, ChangelogItem["type"]> = {
	added: "added",
	changed: "changed",
	fixed: "fixed",
	removed: "removed",
	deprecated: "deprecated",
	security: "security",
}

function detectType(version: string, previous?: string): ChangelogEntry["type"] {
	if (version.includes("-")) return "prerelease"
	if (!previous) return "major"
	const [ma, mi, pa] = version.split(".").map(Number)
	const [pma, pmi] = previous.split(".").map(Number)
	if (ma !== pma) return "major"
	if (mi !== pmi) return "minor"
	return "patch"
}

function detectBreaking(items: ChangelogItem[]): boolean {
	return items.some((i) => /\bBREAKING\b/i.test(i.description))
}

export function parseChangelog(content: string): ChangelogEntry[] {
	const entries: ChangelogEntry[] = []
	const blocks = content.split(/^## /m).slice(1)

	for (const block of blocks) {
		const header = block.match(/^\[([^\]]+)\]\s*-\s*(\S+)(.*)/)
		if (!header) continue

		const version = header[1]!
		const date = header[2]!
		const rest = header[3] ?? ""
		const title = rest.trim() || undefined
		const items: ChangelogItem[] = []
		let currentType: ChangelogItem["type"] | null = null

		for (const line of block.split("\n").slice(1)) {
			const section = line.match(/^### (.+)/)
			if (section) {
				currentType = sectionMap[section[1]!.toLowerCase()] ?? null
				continue
			}
			const item = line.match(/^- (.+)/)
			if (item && currentType) {
				items.push({ type: currentType, description: item[1]!.trim() })
			}
		}

		entries.push({
			version,
			date,
			title,
			description: items.map((i) => i.description).join(", "),
			type: "patch",
			breaking: detectBreaking(items),
			items,
		})
	}

	entries.sort((a, b) => b.date.localeCompare(a.date))

	for (let i = 0; i < entries.length; i++) {
		const prev = entries[i + 1]
		entries[i]!.type = detectType(entries[i]!.version, prev?.version)
	}

	return entries
}

function escape(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function generateChangelogRss(
	config: { title: string; baseUrl: string; description: string },
	entries: ChangelogEntry[],
): string {
	const items = entries
		.map(
			(e) =>
				`<item><title>${escape(e.version)}${e.title ? ` - ${escape(e.title)}` : ""}</title>` +
				`<link>${config.baseUrl}/changelog#${e.version}</link>` +
				`<pubDate>${new Date(e.date).toUTCString()}</pubDate>` +
				`<description>${escape(e.items.map((i) => `${i.type}: ${i.description}`).join("\n"))}</description></item>`,
		)
		.join("\n")

	return (
		`<?xml version="1.0" encoding="UTF-8"?>` +
		`<rss version="2.0"><channel>` +
		`<title>${escape(config.title)}</title>` +
		`<link>${config.baseUrl}</link>` +
		`<description>${escape(config.description)}</description>` +
		`${items}</channel></rss>`
	)
}

export function latestVersion(entries: ChangelogEntry[]): ChangelogEntry | undefined {
	return entries[0]
}

export function filterByType(
	entries: ChangelogEntry[],
	type: ChangelogEntry["type"],
): ChangelogEntry[] {
	return entries.filter((e) => e.type === type)
}

export function hasBreaking(entries: ChangelogEntry[]): ChangelogEntry[] {
	return entries.filter((e) => e.breaking)
}

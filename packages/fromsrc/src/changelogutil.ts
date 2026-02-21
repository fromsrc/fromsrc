export type ChangelogEntry = {
	version: string
	date: string
	changes: { type: string; items: string[] }[]
}

export type ChangelogData = {
	title?: string
	description?: string
	entries: ChangelogEntry[]
}

export function parseChangelog(content: string): ChangelogData {
	const lines = content.split("\n")
	let title: string | undefined
	let description: string | undefined
	const entries: ChangelogEntry[] = []
	let current: ChangelogEntry | null = null
	let section: { type: string; items: string[] } | null = null

	for (const line of lines) {
		const h1 = line.match(/^# (.+)/)
		if (h1) {
			const heading = h1[1]
			if (heading) title = heading.trim()
			continue
		}

		const h2 = line.match(/^## \[([^\]]+)\]\s*-\s*(.+)/)
		if (h2) {
			if (current) entries.push(current)
			section = null
			const version = h2[1]
			const date = h2[2]
			if (!version || !date) continue
			current = { version: version.trim(), date: date.trim(), changes: [] }
			continue
		}

		const h3 = line.match(/^### (.+)/)
		if (h3 && current) {
			const type = h3[1]
			if (!type) continue
			section = { type: type.trim(), items: [] }
			current.changes.push(section)
			continue
		}

		const item = line.match(/^- (.+)/)
		if (item && section) {
			const value = item[1]
			if (value) section.items.push(value.trim())
			continue
		}

		if (!current && !title && line.trim()) {
			description = description ? `${description}\n${line.trim()}` : line.trim()
		}
	}

	if (current) entries.push(current)
	return { title, description, entries }
}

export function formatChangelog(data: ChangelogData): string {
	const lines: string[] = []
	if (data.title) lines.push(`# ${data.title}`, "")
	if (data.description) lines.push(data.description, "")

	for (const entry of data.entries) {
		lines.push(`## [${entry.version}] - ${entry.date}`, "")
		for (const change of entry.changes) {
			lines.push(`### ${change.type}`, "")
			for (const item of change.items) lines.push(`- ${item}`)
			lines.push("")
		}
	}

	return lines.join("\n")
}

export function getLatestVersion(data: ChangelogData): ChangelogEntry | undefined {
	return data.entries[0]
}

export function getVersionsBetween(
	data: ChangelogData,
	from: string,
	to: string,
): ChangelogEntry[] {
	const start = data.entries.findIndex((e) => e.version === from)
	const end = data.entries.findIndex((e) => e.version === to)
	if (start === -1 || end === -1) return []
	const lo = Math.min(start, end)
	const hi = Math.max(start, end)
	return data.entries.slice(lo, hi + 1)
}

export function groupByType(entries: ChangelogEntry[]): Record<string, string[]> {
	const result: Record<string, string[]> = {}
	for (const entry of entries) {
		for (const change of entry.changes) {
			const list = result[change.type] ?? []
			list.push(...change.items)
			result[change.type] = list
		}
	}
	return result
}

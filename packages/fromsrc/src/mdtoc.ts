export type TocItem = {
	level: number
	text: string
	slug: string
}

export type TocOptions = {
	minLevel?: number
	maxLevel?: number
	ordered?: boolean
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9_-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "")
}

export function extractToc(content: string): TocItem[] {
	const items: TocItem[] = []
	const lines = content.split("\n")
	let inCodeBlock = false

	for (const line of lines) {
		if (line.trimStart().startsWith("```")) {
			inCodeBlock = !inCodeBlock
			continue
		}
		if (inCodeBlock) continue

		const match = line.match(/^(#{1,6})\s+(.+)$/)
		if (!match) continue
		const hashes = match[1]
		const heading = match[2]
		if (!hashes || !heading) continue
		const level = hashes.length
		const text = heading.trim()
		items.push({ level, text, slug: slugify(text) })
	}

	return items
}

export function generateTocMarkdown(items: TocItem[], options?: TocOptions): string {
	const min = options?.minLevel ?? 2
	const max = options?.maxLevel ?? 4
	const ordered = options?.ordered ?? false
	const prefix = ordered ? "1." : "-"

	return items
		.filter((item) => item.level >= min && item.level <= max)
		.map((item) => {
			const indent = "\t".repeat(item.level - min)
			return `${indent}${prefix} [${item.text}](#${item.slug})`
		})
		.join("\n")
}

export function removeToc(content: string): string {
	return content.replace(/<!-- toc -->\n[\s\S]*?<!-- \/toc -->\n?/, "")
}

export function injectToc(content: string, options?: TocOptions): string {
	const items = extractToc(content)
	const toc = `<!-- toc -->\n${generateTocMarkdown(items, options)}\n<!-- /toc -->`
	const cleaned = removeToc(content)

	if (cleaned.includes("<!-- toc -->")) {
		return cleaned.replace("<!-- toc -->", toc)
	}

	const fmMatch = cleaned.match(/^---\n[\s\S]*?\n---\n/)
	if (fmMatch) {
		return `${fmMatch[0]}\n${toc}\n\n${cleaned.slice(fmMatch[0].length)}`
	}

	return `${toc}\n\n${cleaned}`
}

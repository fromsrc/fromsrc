import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"

export interface LinkIssue {
	file: string
	line: number
	link: string
	type: "broken" | "external"
}

export interface ValidateOptions {
	docsDir: string
	checkExternal?: boolean
}

export async function validateLinks(options: ValidateOptions): Promise<LinkIssue[]> {
	const { docsDir, checkExternal = false } = options
	const issues: LinkIssue[] = []
	const validSlugs = new Set<string>()

	async function collectSlugs(dir: string, prefix = "") {
		const entries = await readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			if (entry.isDirectory()) {
				await collectSlugs(join(dir, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				const slug = `${prefix}${entry.name.replace(".mdx", "")}`
				validSlugs.add(slug === "index" ? "" : slug)
				validSlugs.add(`/docs/${slug === "index" ? "" : slug}`)
			}
		}
	}

	async function scanFile(filepath: string, relativePath: string) {
		const content = await readFile(filepath, "utf-8")
		const lines = content.split("\n")

		const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
		const hrefRegex = /href=["']([^"']+)["']/g

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]!
			let match: RegExpExecArray | null

			while ((match = linkRegex.exec(line)) !== null) {
				const link = match[2]!
				checkLink(link, relativePath, i + 1, issues, validSlugs, checkExternal)
			}

			while ((match = hrefRegex.exec(line)) !== null) {
				const link = match[1]!
				checkLink(link, relativePath, i + 1, issues, validSlugs, checkExternal)
			}
		}
	}

	async function scanDir(dir: string, prefix = "") {
		const entries = await readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			if (entry.isDirectory()) {
				await scanDir(join(dir, entry.name), `${prefix}${entry.name}/`)
			} else if (entry.name.endsWith(".mdx")) {
				await scanFile(join(dir, entry.name), `${prefix}${entry.name}`)
			}
		}
	}

	await collectSlugs(docsDir)
	await scanDir(docsDir)

	return issues
}

function checkLink(
	link: string,
	file: string,
	line: number,
	issues: LinkIssue[],
	validSlugs: Set<string>,
	checkExternal: boolean,
) {
	if (link.startsWith("#")) return
	if (link.startsWith("mailto:")) return
	if (link.startsWith("tel:")) return

	if (link.startsWith("http://") || link.startsWith("https://")) {
		if (checkExternal) {
			issues.push({ file, line, link, type: "external" })
		}
		return
	}

	const normalized = link.split("#")[0]!.split("?")[0]!

	if (!validSlugs.has(normalized) && !normalized.startsWith("/docs/")) {
		const withPrefix = `/docs${normalized.startsWith("/") ? "" : "/"}${normalized}`
		if (!validSlugs.has(withPrefix)) {
			issues.push({ file, line, link, type: "broken" })
		}
	}
}

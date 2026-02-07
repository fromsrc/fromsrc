import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

export interface LinkCheckConfig {
	dir: string
	baseUrl?: string
	checkExternal?: boolean
	concurrency?: number
	timeout?: number
}

export interface CheckedLink {
	url: string
	line: number
	status: "ok" | "broken" | "redirect" | "timeout" | "skipped"
	statusCode?: number
	redirectTo?: string
}

export interface LinkCheckResult {
	file: string
	links: CheckedLink[]
	errors: number
}

function execAll(regex: RegExp, text: string): RegExpExecArray[] {
	const matches: RegExpExecArray[] = []
	regex.lastIndex = 0
	for (let m = regex.exec(text); m !== null; m = regex.exec(text)) {
		matches.push(m)
	}
	return matches
}

export function extractLinks(content: string): { url: string; line: number }[] {
	const results: { url: string; line: number }[] = []
	const lines = content.split("\n")
	const mdLink = /\[([^\]]*)\]\(([^)]+)\)/g
	const hrefLink = /href=["']([^"']+)["']/g
	const rawUrl = /(?<!\(|"|')https?:\/\/[^\s<>"')\]]+/g

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]!
		const seen = new Set<string>()

		for (const m of execAll(mdLink, line)) {
			if (!seen.has(m[2]!)) {
				seen.add(m[2]!)
				results.push({ url: m[2]!, line: i + 1 })
			}
		}

		for (const m of execAll(hrefLink, line)) {
			if (!seen.has(m[1]!)) {
				seen.add(m[1]!)
				results.push({ url: m[1]!, line: i + 1 })
			}
		}

		for (const m of execAll(rawUrl, line)) {
			if (!seen.has(m[0])) {
				seen.add(m[0])
				results.push({ url: m[0], line: i + 1 })
			}
		}
	}

	return results
}

async function collectSlugs(dir: string, prefix = ""): Promise<Set<string>> {
	const slugs = new Set<string>()
	const entries = await readdir(dir, { withFileTypes: true })

	for (const entry of entries) {
		if (entry.isDirectory()) {
			const nested = await collectSlugs(join(dir, entry.name), `${prefix}${entry.name}/`)
			nested.forEach((s) => slugs.add(s))
		} else if (entry.name.endsWith(".mdx")) {
			const slug =
				entry.name === "index.mdx"
					? prefix.replace(/\/$/, "")
					: `${prefix}${entry.name.replace(".mdx", "")}`
			slugs.add(slug || "/")
		}
	}

	return slugs
}

async function checkExternal(
	url: string,
	timeout: number,
): Promise<Pick<CheckedLink, "status" | "statusCode" | "redirectTo">> {
	try {
		const res = await fetch(url, {
			method: "HEAD",
			redirect: "manual",
			signal: AbortSignal.timeout(timeout),
		})
		if (res.status >= 300 && res.status < 400) {
			return {
				status: "redirect",
				statusCode: res.status,
				redirectTo: res.headers.get("location") ?? undefined,
			}
		}
		return { status: res.ok ? "ok" : "broken", statusCode: res.status }
	} catch (e) {
		if (e instanceof DOMException && e.name === "TimeoutError") return { status: "timeout" }
		return { status: "broken" }
	}
}

function semaphore(limit: number) {
	let active = 0
	const queue: (() => void)[] = []
	return async <T>(fn: () => Promise<T>): Promise<T> => {
		if (active >= limit) await new Promise<void>((r) => queue.push(r))
		active++
		try {
			return await fn()
		} finally {
			active--
			queue.shift()?.()
		}
	}
}

export async function checkLinks(config: LinkCheckConfig): Promise<LinkCheckResult[]> {
	const {
		dir,
		baseUrl = "/docs",
		checkExternal: external = false,
		concurrency = 5,
		timeout = 5000,
	} = config
	const slugs = await collectSlugs(dir)
	const results: LinkCheckResult[] = []
	const lock = semaphore(concurrency)

	async function scan(filepath: string, relative: string) {
		const content = await readFile(filepath, "utf-8")
		const extracted = extractLinks(content)
		const links: CheckedLink[] = []

		const tasks = extracted.map(({ url, line }) =>
			lock(async () => {
				if (url.startsWith("#") || url.startsWith("mailto:") || url.startsWith("tel:")) {
					return
				}

				if (url.startsWith("http://") || url.startsWith("https://")) {
					if (!external) {
						links.push({ url, line, status: "skipped" })
						return
					}
					const result = await checkExternal(url, timeout)
					links.push({ url, line, ...result })
					return
				}

				const clean = url.split("#")[0]!.split("?")[0]!
				const normalized = clean.startsWith(baseUrl)
					? clean.slice(baseUrl.length).replace(/^\//, "")
					: clean.replace(/^\//, "")
				const found =
					slugs.has(normalized) ||
					slugs.has(`${normalized}/`) ||
					slugs.has(normalized.replace(/\/$/, ""))
				links.push({ url, line, status: found ? "ok" : "broken" })
			}),
		)

		await Promise.all(tasks)
		results.push({
			file: relative,
			links,
			errors: links.filter((l) => l.status === "broken").length,
		})
	}

	async function walk(d: string, prefix = "") {
		const entries = await readdir(d, { withFileTypes: true })
		for (const entry of entries) {
			if (entry.isDirectory()) await walk(join(d, entry.name), `${prefix}${entry.name}/`)
			else if (entry.name.endsWith(".mdx"))
				await scan(join(d, entry.name), `${prefix}${entry.name}`)
		}
	}

	await walk(dir)
	return results
}

export function formatResults(results: LinkCheckResult[]): string {
	const lines: string[] = []
	let total = 0
	let broken = 0
	let redirects = 0

	for (const result of results) {
		const bad = result.links.filter((l) => l.status !== "ok" && l.status !== "skipped")
		if (bad.length > 0) {
			lines.push(`\n${result.file}`)
			for (const link of bad) {
				const code = link.statusCode ? ` [${link.statusCode}]` : ""
				const redir = link.redirectTo ? ` -> ${link.redirectTo}` : ""
				lines.push(`  line ${link.line}: ${link.status}${code} ${link.url}${redir}`)
			}
		}
		total += result.links.length
		broken += result.links.filter((l) => l.status === "broken").length
		redirects += result.links.filter((l) => l.status === "redirect").length
	}

	lines.push(`\n${total} links, ${broken} broken, ${redirects} redirects`)
	return lines.join("\n")
}

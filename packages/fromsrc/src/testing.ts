export type TestCase = { name: string; fn: () => Promise<void> | void }
export type TestResult = { name: string; passed: boolean; error?: string; duration: number }
export type TestSuite = {
	name: string
	results: TestResult[]
	passed: number
	failed: number
	duration: number
}

function headingid(value: string): string {
	return value.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-")
}

function collectheadingids(content: string): string[] {
	return [...content.matchAll(/^#{1,6}\s+(.+)$/gm)]
		.map((match) => {
			const value = match[1]
			if (!value) return ""
			return headingid(value)
		})
		.filter(Boolean)
}

export function createTestSuite(name: string) {
	const cases: TestCase[] = []

	function test(caseName: string, fn: () => Promise<void> | void) {
		cases.push({ name: caseName, fn })
	}

	async function run(): Promise<TestSuite> {
		const results: TestResult[] = []
		const start = performance.now()
		for (const c of cases) {
			const t = performance.now()
			try {
				await c.fn()
				results.push({ name: c.name, passed: true, duration: performance.now() - t })
			} catch (e) {
				results.push({
					name: c.name,
					passed: false,
					error: e instanceof Error ? e.message : String(e),
					duration: performance.now() - t,
				})
			}
		}
		return {
			name,
			results,
			passed: results.filter((r) => r.passed).length,
			failed: results.filter((r) => !r.passed).length,
			duration: performance.now() - start,
		}
	}

	return { test, run }
}

export function assertFrontmatter(content: string, fields: string[]) {
	const match = content.match(/^---\n([\s\S]*?)\n---/)
	if (!match) throw new Error("missing frontmatter")
	const body = match[1]
	if (!body) throw new Error("invalid frontmatter")
	const lines = body.split("\n")
	const values = new Map<string, string>()
	for (const line of lines) {
		const index = line.indexOf(":")
		if (index < 1) continue
		const key = line.slice(0, index).trim()
		if (!key) continue
		if (values.has(key)) throw new Error(`duplicate field: ${key}`)
		const value = line.slice(index + 1).trim()
		values.set(key, value)
	}
	for (const field of fields) {
		if (!values.has(field)) throw new Error(`missing field: ${field}`)
		const value = values.get(field) ?? ""
		if (!value) throw new Error(`empty field: ${field}`)
	}
}

export function assertHeadings(
	content: string,
	options?: { minCount?: number; maxDepth?: number; sequential?: boolean },
) {
	const ids = collectheadingids(content)
	const seen = new Set<string>()
	for (const id of ids) {
		if (seen.has(id)) throw new Error(`duplicate heading id: ${id}`)
		seen.add(id)
	}

	const headings = [...content.matchAll(/^(#{1,6})\s+/gm)]
		.map((m) => m[1]?.length ?? 0)
		.filter((level) => level > 0)
	if (options?.minCount && headings.length < options.minCount) {
		throw new Error(`expected at least ${options.minCount} headings, found ${headings.length}`)
	}
	if (options?.maxDepth) {
		for (const level of headings) {
			if (level > options.maxDepth) {
				throw new Error(`heading h${level} exceeds max depth ${options.maxDepth}`)
			}
		}
	}
	if (options?.sequential) {
		for (let i = 1; i < headings.length; i++) {
			const current = headings[i]
			const previous = headings[i - 1]
			if (!current || !previous) continue
			if (current > previous + 1) {
				throw new Error(`heading h${headings[i]} skips level after h${headings[i - 1]}`)
			}
		}
	}
}

export function assertLinks(content: string) {
	const placeholders = new Set(["#", "todo", "http://", "https://", "about:blank", "javascript:void(0)"])
	const headingids = new Set(collectheadingids(content))
	const links = [...content.matchAll(/\[([^\]]*)\]\(([^)]*)\)/g)]
	for (const [, text = "", url = ""] of links) {
		if (!text.trim()) throw new Error("empty link text")
		const value = url.trim()
		const lowered = value.toLowerCase()
		if (!value || placeholders.has(lowered)) {
			throw new Error(`placeholder link: ${url}`)
		}
		if (value.startsWith("#")) {
			const target = value.slice(1).toLowerCase()
			if (!target || !headingids.has(target)) {
				throw new Error(`missing anchor target: ${url}`)
			}
		}
	}
}

export function assertLength(content: string, options: { minWords?: number; maxWords?: number }) {
	const words = content
		.replace(/^---\n[\s\S]*?\n---\n?/, "")
		.split(/\s+/)
		.filter(Boolean).length
	if (options.minWords && words < options.minWords) {
		throw new Error(`expected at least ${options.minWords} words, found ${words}`)
	}
	if (options.maxWords && words > options.maxWords) {
		throw new Error(`expected at most ${options.maxWords} words, found ${words}`)
	}
}

export function formatTestSuite(suite: TestSuite): string {
	const lines = [
		`${suite.name}: ${suite.passed}/${suite.results.length} passed (${Math.round(suite.duration)}ms)`,
	]
	for (const r of suite.results) {
		const status = r.passed ? "pass" : "FAIL"
		lines.push(`  ${status} ${r.name} (${Math.round(r.duration)}ms)`)
		if (r.error) lines.push(`       ${r.error}`)
	}
	return lines.join("\n")
}

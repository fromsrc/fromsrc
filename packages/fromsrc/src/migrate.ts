import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import { dirname, extname, join, relative } from "node:path"

export type MigrateSource = "docusaurus" | "nextra" | "mintlify"

export interface MigrateConfig {
	source: MigrateSource
	inputDir: string
	outputDir: string
}

export interface MigrateResult {
	files: number
	warnings: string[]
}

export type MigrateTransform = (content: string, filepath: string) => string

function convertAdmonitions(content: string): string {
	const lines = content.split("\n")
	const stack: string[] = []
	const result: string[] = []

	for (const line of lines) {
		if (/^:::note\s*$/.test(line)) {
			stack.push("Note")
			result.push("<Note>")
		} else if (/^:::tip\s*$/.test(line)) {
			stack.push("Callout")
			result.push('<Callout type="tip">')
		} else if (/^:::warning\s*$/.test(line)) {
			stack.push("Callout")
			result.push('<Callout type="warning">')
		} else if (/^:::danger\s*$/.test(line)) {
			stack.push("Callout")
			result.push('<Callout type="danger">')
		} else if (/^:::\s*$/.test(line) && stack.length > 0) {
			const tag = stack.pop()!
			result.push(`</${tag}>`)
		} else {
			result.push(line)
		}
	}

	return result.join("\n")
}

export const migrateDocusaurus: MigrateTransform = (content, _filepath) => {
	let out = content
	out = out.replace(/^import\s+.*from\s+['"]@docusaurus\/.*['"];?\s*$/gm, "")
	out = out.replace(
		/<TabItem\s+value="([^"]*)"(?:\s+label="([^"]*)")?>/g,
		'<Tab value="$1" label="$2">',
	)
	out = out.replace(/<\/TabItem>/g, "</Tab>")
	out = out.replace(/<CodeBlock(?:\s+language="([^"]*)")?\s*>/g, "```$1")
	out = out.replace(/<\/CodeBlock>/g, "```")
	out = convertAdmonitions(out)
	out = out.replace(/^sidebar_position:\s*.*$/gm, "")
	out = out.replace(/^sidebar_label:\s*.*$/gm, "")
	out = out.replace(/\n{3,}/g, "\n\n")
	return `${out.trim()}\n`
}

export const migrateNextra: MigrateTransform = (content, _filepath) => {
	let out = content
	out = out.replace(/<Callout\s+type="([^"]*)"(?:\s+emoji="[^"]*")?>/g, '<Callout type="$1">')
	out = out.replace(/<Tabs\s+items=\{(\[.*?\])\}>/g, "<Tabs items={$1}>")
	out = out.replace(/<Tabs\.Tab>/g, "<Tab>")
	out = out.replace(/<\/Tabs\.Tab>/g, "</Tab>")
	return `${out.trim()}\n`
}

export const migrateMintlify: MigrateTransform = (content, _filepath) => {
	let out = content
	out = out.replace(/<CardGroup(?:\s+cols=\{(\d+)\})?>/g, "<Cards>")
	out = out.replace(/<\/CardGroup>/g, "</Cards>")
	out = out.replace(/^api:\s*.*$/gm, "")
	out = out.replace(/^openapi:\s*.*$/gm, "")
	out = out.replace(/^auth:\s*.*$/gm, "")
	out = out.replace(/\n{3,}/g, "\n\n")
	return `${out.trim()}\n`
}

const transforms: Record<MigrateSource, MigrateTransform> = {
	docusaurus: migrateDocusaurus,
	nextra: migrateNextra,
	mintlify: migrateMintlify,
}

async function collectFiles(dir: string): Promise<string[]> {
	const results: string[] = []
	const entries = await readdir(dir, { withFileTypes: true })

	for (const entry of entries) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) {
			results.push(...(await collectFiles(full)))
		} else if ([".md", ".mdx"].includes(extname(entry.name))) {
			results.push(full)
		}
	}

	return results
}

export async function migrate(config: MigrateConfig): Promise<MigrateResult> {
	const { source, inputDir, outputDir } = config
	const transform = transforms[source]
	const warnings: string[] = []
	const files = await collectFiles(inputDir)

	let count = 0
	for (const filepath of files) {
		const rel = relative(inputDir, filepath)
		const dest = join(outputDir, rel)

		try {
			const content = await readFile(filepath, "utf-8")
			const result = transform(content, filepath)
			await mkdir(dirname(dest), { recursive: true })
			await writeFile(dest, result, "utf-8")
			count++
		} catch (err) {
			warnings.push(`${rel}: ${err instanceof Error ? err.message : String(err)}`)
		}
	}

	return { files: count, warnings }
}

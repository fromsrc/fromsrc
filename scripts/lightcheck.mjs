import { promises as fs } from "node:fs"
import path from "node:path"

const root = process.cwd()
const src = path.join(root, "packages", "fromsrc", "src")

const files = [
	"readtime.ts",
	"searchscore.ts",
	"searchindex.ts",
	"llms.ts",
	"openapi.ts",
	"algolia.ts",
	"orama.ts",
]

const blocked = [
	"react",
	"react-dom",
	"next",
	"next-mdx-remote",
	"@mdx-js/mdx",
	"shiki",
	"katex",
	"lucide-react",
]

const pattern = /from\s+["']([^"']+)["']/g
const issues = []

for (const name of files) {
	const file = path.join(src, name)
	const text = await fs.readFile(file, "utf8")
	let match = pattern.exec(text)
	while (match) {
		const target = match[1]
		if (!target) {
			match = pattern.exec(text)
			continue
		}
		for (const item of blocked) {
			if (target === item || target.startsWith(`${item}/`)) {
				issues.push(`${path.relative(root, file)} -> ${target}`)
			}
		}
		match = pattern.exec(text)
	}
}

if (issues.length > 0) {
	console.error("x lightweight entrypoint dependency violations:")
	for (const issue of issues) console.error(issue)
	process.exit(1)
}

console.log(`o lightweight entrypoint dependencies validated (${files.length} files)`)

import { promises as fs } from "node:fs"
import path from "node:path"

const root = process.cwd()
const source = path.join(root, "packages", "fromsrc", "src")
const filepattern = /\.(ts|tsx)$/
const checkpattern = /(?:\w|\]|\)|\})!\s*(?:[\[().,;:]|$)/g

async function collect(folder) {
	const names = await fs.readdir(folder, { withFileTypes: true })
	const files = []
	for (const name of names) {
		const full = path.join(folder, name.name)
		if (name.isDirectory()) {
			files.push(...(await collect(full)))
			continue
		}
		if (filepattern.test(name.name)) files.push(full)
	}
	return files
}

const files = await collect(source)
const found = []
for (const file of files) {
	const text = await fs.readFile(file, "utf8")
	const lines = text.split("\n")
	for (let index = 0; index < lines.length; index += 1) {
		const line = lines[index]
		if (!line) continue
		checkpattern.lastIndex = 0
		if (!checkpattern.test(line)) continue
		found.push(`${path.relative(root, file)}:${index + 1}`)
	}
}

if (found.length > 0) {
	console.error("x non-null assertions detected:")
	for (const entry of found) console.error(entry)
	process.exit(1)
}

console.log(`o no non-null assertions found in ${files.length} files`)

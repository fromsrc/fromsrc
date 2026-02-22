import { promises as fs } from "node:fs"
import path from "node:path"
import { isclientdirective } from "./clientutil.mjs"

const root = process.cwd()
const source = path.join(root, "packages", "fromsrc", "src")
const dist = path.join(root, "packages", "fromsrc", "dist")
const filepattern = /\.(ts|tsx|js|jsx)$/

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

function todist(file) {
	const rel = path.relative(source, file)
	return path.join(dist, rel.replace(/\.(tsx|ts|jsx|js)$/, ".js"))
}

const sourcefiles = await collect(source)
const expected = []
for (const file of sourcefiles) {
	const text = await fs.readFile(file, "utf8")
	if (isclientdirective(text)) expected.push(file)
}

const missing = []
for (const file of expected) {
	const output = todist(file)
	try {
		const text = await fs.readFile(output, "utf8")
		if (!isclientdirective(text)) missing.push(path.relative(root, output))
	} catch {
		missing.push(path.relative(root, output))
	}
}

if (missing.length > 0) {
	console.error("x missing use client directives in dist:")
	for (const entry of missing) console.error(entry)
	process.exit(1)
}

console.log(`o use client directives preserved for ${expected.length} files`)

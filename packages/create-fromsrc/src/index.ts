import { execSync } from "node:child_process"
import { cpSync, mkdirSync, writeFileSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

interface CreateOptions {
	name: string
	template: string
	install: boolean
}

export async function create(options: CreateOptions) {
	const { name, template, install } = options
	const cwd = process.cwd()
	const target = join(cwd, name)

	if (existsSync(target)) {
		throw new Error(`directory ${name} already exists`)
	}

	mkdirSync(target, { recursive: true })

	const __dirname = dirname(fileURLToPath(import.meta.url))
	const templateDir = join(__dirname, "..", "template", template)

	if (!existsSync(templateDir)) {
		throw new Error(`template ${template} not found`)
	}

	cpSync(templateDir, target, { recursive: true })

	const gitignorePath = join(target, "gitignore")
	if (existsSync(gitignorePath)) {
		const newPath = join(target, ".gitignore")
		cpSync(gitignorePath, newPath)
		execSync(`rm ${gitignorePath}`)
	}

	if (install) {
		execSync("bun install", { cwd: target, stdio: "inherit" })
	}

	return target
}

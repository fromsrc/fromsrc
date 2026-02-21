import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { defineConfig } from "tsup"

function allfiles(dir: string): string[] {
	if (!existsSync(dir)) return []
	const list: string[] = []
	for (const name of readdirSync(dir)) {
		const path = join(dir, name)
		const stat = statSync(path)
		if (stat.isDirectory()) {
			list.push(...allfiles(path))
			continue
		}
		list.push(path)
	}
	return list
}

function patch(file: string) {
	if (!file.endsWith(".js")) return
	let text = readFileSync(file, "utf-8")
	text = text.replace(
		/import\((['"])mermaid\1\)/g,
		"import(/* webpackIgnore: true */ $1mermaid$1)",
	)
	text = text.replace(
		/import\(join\(dir, name\)\)/g,
		"import(/* webpackIgnore: true */ join(dir, name))",
	)
	writeFileSync(file, text)
}

function patchall() {
	for (const file of allfiles("dist")) patch(file)
}

function distfile(file: string) {
	const path = file.replace(/^src\//, "dist/")
	return path.replace(/\.(tsx|ts|jsx|js)$/, ".js")
}

function isclient(file: string) {
	if (!/\.(tsx|ts|jsx|js)$/.test(file)) return false
	const text = readFileSync(file, "utf-8")
	const first = text.split("\n", 1).at(0) ?? ""
	return /^["']use client["'];?$/.test(first.trim())
}

function patchclient() {
	for (const file of allfiles("src")) {
		if (!isclient(file)) continue
		const path = distfile(file)
		if (!existsSync(path)) continue
		const text = readFileSync(path, "utf-8")
		if (text.startsWith("\"use client\";\n")) continue
		writeFileSync(path, `"use client";\n${text}`)
	}
}

function finish() {
	patchall()
	patchclient()
}

const external = [
	"react",
	"react/jsx-runtime",
	"next",
	"next/*",
	"mermaid",
	"katex",
	"@tanstack/react-router",
	"react-router-dom",
	"@remix-run/react",
]

export default defineConfig([
	{
		entry: [
			"src/**/*.ts",
			"src/**/*.tsx",
		],
		format: ["esm"],
		bundle: false,
		treeshake: true,
		dts: true,
		splitting: false,
		clean: false,
		external,
		onSuccess: async () => {
			finish()
		},
	},
])

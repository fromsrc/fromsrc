import { readFileSync, writeFileSync } from "node:fs"
import { defineConfig } from "tsup"

function ignore(file: string, patterns: RegExp[]) {
	let content = readFileSync(file, "utf-8")
	for (const p of patterns) {
		content = content.replace(p, (m) => m.replace("import(", "import(/* webpackIgnore: true */ "))
	}
	writeFileSync(file, content)
}

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["esm"],
		dts: true,
		treeshake: true,
		external: ["react", "next", "react/jsx-runtime"],
		onSuccess: async () => {
			ignore("dist/index.js", [/import\(join\(dir, name\)\)/g])
		},
	},
	{
		entry: ["src/client.ts"],
		format: ["esm"],
		dts: true,
		treeshake: true,
		splitting: false,
		external: ["react", "next", "react/jsx-runtime", "mermaid", "katex"],
		onSuccess: async () => {
			const path = "dist/client.js"
			let content = readFileSync(path, "utf-8")
			content = content.replace(
				/import\(['"]mermaid['"]\)/g,
				"import(/* webpackIgnore: true */ 'mermaid')",
			)
			writeFileSync(path, `"use client";\n${content}`)
		},
	},
	{
		entry: ["src/next.ts"],
		format: ["esm"],
		dts: true,
		treeshake: true,
		splitting: false,
		external: ["react", "next", "react/jsx-runtime"],
		onSuccess: async () => {
			const path = "dist/next.js"
			const content = readFileSync(path, "utf-8")
			writeFileSync(path, `"use client";\n${content}`)
		},
	},
	{
		entry: ["src/reactrouter.ts"],
		format: ["esm"],
		dts: true,
		treeshake: true,
		splitting: false,
		external: ["react", "react/jsx-runtime", "react-router-dom"],
		onSuccess: async () => {
			const path = "dist/reactrouter.js"
			const content = readFileSync(path, "utf-8")
			writeFileSync(path, `"use client";\n${content}`)
		},
	},
	{
		entry: ["src/vite.ts"],
		format: ["esm"],
		dts: true,
		treeshake: true,
		splitting: false,
		external: ["react", "react/jsx-runtime"],
		onSuccess: async () => {
			const path = "dist/vite.js"
			const content = readFileSync(path, "utf-8")
			writeFileSync(path, `"use client";\n${content}`)
		},
	},
])

import { readFileSync, writeFileSync } from "node:fs"
import { defineConfig } from "tsup"

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["esm"],
		dts: true,
		treeshake: true,
		external: ["react", "next", "react/jsx-runtime"],
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
			const content = readFileSync(path, "utf-8")
			writeFileSync(path, `"use client";\n${content}`)
		},
	},
])

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
		splitting: true,
		external: ["react", "next", "react/jsx-runtime", "mermaid", "katex"],
		banner: {
			js: '"use client";',
		},
	},
])

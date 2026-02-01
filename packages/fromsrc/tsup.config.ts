import { defineConfig } from "tsup"

export default defineConfig([
	{
		entry: ["src/index.ts"],
		format: ["esm"],
		dts: true,
		external: ["react", "next", "react/jsx-runtime"],
	},
	{
		entry: ["src/client.ts"],
		format: ["esm"],
		dts: true,
		external: ["react", "next", "react/jsx-runtime"],
		banner: {
			js: '"use client";',
		},
	},
])

export function packagejson(name: string): string {
	return JSON.stringify(
		{
			name,
			version: "0.0.0",
			private: true,
			scripts: {
				dev: "next dev",
				build: "next build",
				start: "next start",
			},
			dependencies: {
				fromsrc: "latest",
				next: "^16.0.0",
				react: "^19.0.0",
				"react-dom": "^19.0.0",
			},
			devDependencies: {
				"@tailwindcss/postcss": "^4.0.0",
				"@types/node": "^22.0.0",
				"@types/react": "^19.0.0",
				postcss: "^8.0.0",
				tailwindcss: "^4.0.0",
				typescript: "^5.0.0",
			},
		},
		null,
		"\t",
	)
}

export const nextconfig = `import type { NextConfig } from "next"

const config: NextConfig = {}

export default config
`

export const tsconfig = JSON.stringify(
	{
		compilerOptions: {
			target: "ES2017",
			lib: ["dom", "dom.iterable", "esnext"],
			allowJs: true,
			skipLibCheck: true,
			strict: true,
			noEmit: true,
			esModuleInterop: true,
			module: "esnext",
			moduleResolution: "bundler",
			resolveJsonModule: true,
			isolatedModules: true,
			jsx: "preserve",
			incremental: true,
			plugins: [{ name: "next" }],
			paths: { "@/*": ["./*"] },
		},
		include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
		exclude: ["node_modules"],
	},
	null,
	"\t",
)

export const tailwindconfig = `import type { Config } from "tailwindcss"

const config: Config = {
\tcontent: ["./app/**/*.{ts,tsx}", "./content/**/*.mdx"],
\ttheme: {
\t\textend: {},
\t},
\tplugins: [],
}

export default config
`

export const postcssconfig = `export default {
\tplugins: {
\t\t"@tailwindcss/postcss": {},
\t},
}
`

export const globalscss = `@import "tailwindcss";

@theme {
\t--color-bg: #0c0c0c;
\t--color-fg: #fafafa;
\t--color-muted: #737373;
\t--color-dim: #404040;
\t--color-line: #1c1c1c;
\t--color-surface: #141414;
\t--color-accent: #ef4444;

\t--font-mono: var(--font-mono), ui-monospace, monospace;
}

@layer base {
\t* {
\t\tbox-sizing: border-box;
\t\tpadding: 0;
\t\tmargin: 0;
\t}
\thtml {
\t\tscroll-behavior: smooth;
\t}
\thtml,
\tbody {
\t\theight: 100%;
\t}
\ta {
\t\tcolor: inherit;
\t\ttext-decoration: none;
\t}
\tbody {
\t\tcolor: var(--color-fg);
\t\tbackground: var(--color-bg);
\t\tfont-family: var(--font-mono);
\t\t-webkit-font-smoothing: antialiased;
\t\tfont-size: 13px;
\t\tline-height: 1.7;
\t}
\t::selection {
\t\tbackground: var(--color-fg);
\t\tcolor: var(--color-bg);
\t}
}

@layer components {
\t.shiki,
\t.shiki span {
\t\tcolor: var(--shiki-dark) !important;
\t\tbackground-color: transparent !important;
\t}
}
`

export const gitignore = `node_modules
.next
dist
`

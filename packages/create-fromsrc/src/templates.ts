export type Framework = "next.js" | "react-router" | "vite" | "tanstack" | "remix" | "astro"

export function packagejson(name: string, framework: Framework): string {
	const base = {
		name,
		version: "0.0.0",
		private: true,
		dependencies: {
			fromsrc: "latest",
			react: "^19.0.0",
			"react-dom": "^19.0.0",
		},
		devDependencies: {
			"@types/node": "^22.0.0",
			"@types/react": "^19.0.0",
			typescript: "^5.0.0",
		},
	}

	if (framework === "next.js") {
		return JSON.stringify(
			{
				...base,
				scripts: {
					dev: "next dev",
					build: "next build",
					start: "next start",
				},
				dependencies: {
					...base.dependencies,
					next: "^16.0.0",
				},
				devDependencies: {
					...base.devDependencies,
					"@tailwindcss/postcss": "^4.0.0",
					postcss: "^8.0.0",
					tailwindcss: "^4.0.0",
				},
			},
			null,
			"\t",
		)
	}

	if (framework === "astro") {
		return JSON.stringify(
			{
				...base,
				scripts: {
					dev: "astro dev",
					build: "astro build",
					start: "astro preview",
				},
				dependencies: {
					...base.dependencies,
					astro: "^5.0.0",
				},
			},
			null,
			"\t",
		)
	}

	const deps: Record<Framework, Record<string, string>> = {
		"next.js": {},
		"react-router": { "react-router-dom": "^7.0.0" },
		vite: { vite: "^7.0.0" },
		tanstack: { "@tanstack/react-router": "^1.0.0", vite: "^7.0.0" },
		remix: { "@remix-run/react": "^2.0.0", "react-router-dom": "^7.0.0", vite: "^7.0.0" },
		astro: {},
	}

	const scripts: Record<Framework, Record<string, string>> = {
		"next.js": {},
		"react-router": {
			dev: "vite",
			build: "vite build",
			start: "vite preview",
		},
		vite: {
			dev: "vite",
			build: "vite build",
			start: "vite preview",
		},
		tanstack: {
			dev: "vite",
			build: "vite build",
			start: "vite preview",
		},
		remix: {
			dev: "vite",
			build: "vite build",
			start: "vite preview",
		},
		astro: {},
	}

	return JSON.stringify(
		{
			...base,
			scripts: scripts[framework],
			dependencies: {
				...base.dependencies,
				...deps[framework],
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

const browsermap = {
	"react-router": {
		path: "fromsrc/react-router",
		name: "reactRouterAdapter",
		framework: "react-router",
	},
	vite: {
		path: "fromsrc/vite",
		name: "viteAdapter",
		framework: "vite",
	},
	tanstack: {
		path: "fromsrc/tanstack",
		name: "tanstackAdapter",
		framework: "tanstack",
	},
	remix: {
		path: "fromsrc/remix",
		name: "remixAdapter",
		framework: "remix",
	},
} as const

type Browserframework = keyof typeof browsermap

export function browserentry(framework: Browserframework) {
	const current = browsermap[framework]
	return `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { AdapterProvider, ${current.name} } from "${current.path}"
import { app } from "./app"
import "./globals.css"

const root = document.getElementById("root")
if (root) {
\tcreateRoot(root).render(
\t\t<StrictMode>
\t\t\t<AdapterProvider adapter={${current.name}}>{app()}</AdapterProvider>
\t\t</StrictMode>,
\t)
}
`
}

export const browserapp = `export function app() {
\treturn (
\t\t<main style={{ padding: 24, fontFamily: "system-ui" }}>
\t\t\t<h1>fromsrc</h1>
\t\t\t<p>edit files in src/ to start building docs.</p>
\t\t</main>
\t)
}
`

export const vitehtml = `<!doctype html>
<html lang="en">
\t<head>
\t\t<meta charset="UTF-8" />
\t\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />
\t\t<title>fromsrc</title>
\t</head>
\t<body>
\t\t<div id="root"></div>
\t\t<script type="module" src="/src/main.tsx"></script>
\t</body>
</html>
`

export const astroconfig = `import { defineConfig } from "astro/config"

export default defineConfig({})
`

export const astropage = `---
import { AdapterProvider, astroAdapter } from "fromsrc/astro"
---

<AdapterProvider adapter={astroAdapter}>
\t<main style="padding:24px;font-family:system-ui">
\t\t<h1>fromsrc</h1>
\t\t<p>edit files in src/pages/ to start building docs.</p>
\t</main>
</AdapterProvider>
`

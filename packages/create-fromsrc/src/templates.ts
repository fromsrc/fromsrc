import type { Framework } from "./frameworks"

export function packagejson(name: string, framework: Framework): string {
	const base = {
		name,
		version: "0.0.0",
		private: true,
		engines: {
			node: "^20.19.0 || >=22.12.0",
		},
		dependencies: {
			fromsrc: "^0.0.0",
			react: "^19.0.0",
			"react-dom": "^19.0.0",
		},
		devDependencies: {
			"@types/node": "^22.0.0",
			"@types/react": "^19.0.0",
			"@types/react-dom": "^19.0.0",
			typescript: "^5.0.0",
		},
	}

	if (framework === "next.js") {
		return JSON.stringify(
			{
				...base,
				scripts: {
					dev: "next dev",
					"dev:up": "bun dev",
					"dev:status": "echo dev server runs on bun dev",
					"dev:down": "echo stop dev with ctrl+c",
					build: "next build",
					start: "next start",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
					next: "^16.0.0",
					"next-mdx-remote": "^6.0.0",
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
					"dev:up": "bun dev",
					"dev:status": "echo dev server runs on bun dev",
					"dev:down": "echo stop dev with ctrl+c",
					build: "astro build",
					start: "astro preview",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
					astro: "^5.0.0",
					marked: "^16.4.1",
				},
				devDependencies: {
					...base.devDependencies,
				},
			},
			null,
			"\t",
		)
	}

	if (framework === "remix") {
		return JSON.stringify(
			{
				...base,
				scripts: {
					dev: "remix vite:dev",
					"dev:up": "bun dev",
					"dev:status": "echo dev server runs on bun dev",
					"dev:down": "echo stop dev with ctrl+c",
					build: "remix vite:build",
					start: "remix-serve ./build/server/index.js",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
					"@remix-run/node": "^2.17.2",
					"@remix-run/react": "^2.17.2",
					marked: "^16.4.1",
				},
				devDependencies: {
					...base.devDependencies,
					"@remix-run/dev": "^2.17.2",
					vite: "^7.1.12",
				},
			},
			null,
			"\t",
		)
	}

	if (framework === "react-router" || framework === "vite" || framework === "tanstack") {
		return JSON.stringify(
			{
				...base,
				scripts: {
					dev: "vite",
					"dev:up": "bun dev",
					"dev:status": "echo dev server runs on bun dev",
					"dev:down": "echo stop dev with ctrl+c",
					build: "vite build",
					start: "vite preview",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
					marked: "^16.4.1",
				},
				devDependencies: {
					...base.devDependencies,
					vite: "^7.1.12",
				},
			},
			null,
			"\t",
		)
	}

	throw new Error(`unsupported framework: ${framework}`)
}

export const nextconfig = `import type { NextConfig } from "next"

const config: NextConfig = {}

export default config
`

export function tsconfig(framework: Framework) {
	if (framework === "astro") {
		return JSON.stringify(
			{
				extends: "astro/tsconfigs/strict",
				include: [".astro/types.d.ts", "**/*"],
				exclude: ["dist"],
			},
			null,
			"\t",
		)
	}

	if (framework === "remix") {
		return JSON.stringify(
			{
				compilerOptions: {
					target: "ES2022",
					lib: ["DOM", "DOM.Iterable", "ES2022"],
					module: "ESNext",
					moduleResolution: "Bundler",
					jsx: "react-jsx",
					types: ["@remix-run/node", "vite/client"],
					strict: true,
					resolveJsonModule: true,
					noEmit: true,
					allowJs: true,
					esModuleInterop: true,
					isolatedModules: true,
					skipLibCheck: true,
				},
				include: ["**/*.ts", "**/*.tsx"],
				exclude: ["node_modules"],
			},
			null,
			"\t",
		)
	}

	return JSON.stringify(
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
				jsx: framework === "next.js" ? "preserve" : "react-jsx",
				incremental: true,
				plugins: framework === "next.js" ? [{ name: "next" }] : [],
				paths: { "@/*": ["./*"] },
			},
			include: framework === "next.js" ? ["next-env.d.ts", "**/*.ts", "**/*.tsx"] : ["**/*.ts", "**/*.tsx"],
			exclude: ["node_modules"],
		},
		null,
		"\t",
	)
}

export const nextenv = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`

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

export const nextglobalscss = `@import "tailwindcss";

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

export const globalscss = `* {
\tbox-sizing: border-box;
\tmargin: 0;
\tpadding: 0;
}

html,
body {
\theight: 100%;
}

body {
\tbackground: #0c0c0c;
\tcolor: #fafafa;
\tfont-family: ui-monospace, monospace;
\tfont-size: 13px;
\tline-height: 1.7;
}

a {
\tcolor: inherit;
\ttext-decoration: none;
}
`

export const gitignore = `node_modules
.next
dist
`

export function browserentry() {
	return `import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { app } from "./app"
import "./globals.css"

const root = document.getElementById("root")
if (root) {
\tcreateRoot(root).render(
\t\t<StrictMode>
\t\t\t{app()}
\t\t</StrictMode>,
\t)
}
`
}

export const browserapp = `import { marked } from "marked"
import doc from "../content/docs/index.mdx?raw"

function text(value: string): string {
\treturn value
\t\t.toLowerCase()
\t\t.replace(/\\s+/g, "-")
\t\t.replace(/[^a-z0-9_-]/g, "")
\t\t.replace(/-+/g, "-")
\t\t.replace(/^-|-$/g, "")
}

function sections(source: string): { id: string; title: string }[] {
\tconst values: { id: string; title: string }[] = []
\tfor (const match of source.matchAll(/^##\\s+(.+)$/gm)) {
\t\tconst title = (match[1] ?? "").trim()
\t\tif (!title) continue
\t\tvalues.push({ id: text(title), title })
\t}
\treturn values
}

export function app() {
\tif (window.location.pathname === "/") {
\t\twindow.history.replaceState(null, "", "/docs")
\t}
\tconst links = sections(doc)
\tconst html = String(marked.parse(doc))
\treturn (
\t\t<div style={{ display: "grid", gridTemplateColumns: "220px 1fr 200px", minHeight: "100vh" }}>
\t\t\t<aside style={{ borderRight: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t<a href="/docs" style={{ display: "block", color: "#fafafa" }}>
\t\t\t\t\tgetting started
\t\t\t\t</a>
\t\t\t</aside>
\t\t\t<main style={{ padding: 24 }}>
\t\t\t\t<article dangerouslySetInnerHTML={{ __html: html }} />
\t\t\t</main>
\t\t\t<aside style={{ borderLeft: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t{links.map((link) => (
\t\t\t\t\t<a key={link.id} href={\`#\${link.id}\`} style={{ display: "block", marginBottom: 8, color: "#737373" }}>
\t\t\t\t\t\t{link.title}
\t\t\t\t\t</a>
\t\t\t\t))}
\t\t\t</aside>
\t\t</div>
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

export const astroindex = `---
return Astro.redirect("/docs")
---`

export const astropage = `---
import { marked } from "marked"
import doc from "../../content/docs/index.mdx?raw"
const html = String(marked.parse(doc))

function text(value: string): string {
\treturn value
\t\t.toLowerCase()
\t\t.replace(/\\s+/g, "-")
\t\t.replace(/[^a-z0-9_-]/g, "")
\t\t.replace(/-+/g, "-")
\t\t.replace(/^-|-$/g, "")
}

const links = Array.from(doc.matchAll(/^##\\s+(.+)$/gm))
\t.map((entry) => (entry[1] ?? "").trim())
\t.filter((entry) => entry.length > 0)
\t.map((entry) => ({ id: text(entry), title: entry }))
---

<html lang="en">
\t<head>
\t\t<meta charset="utf-8" />
\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />
\t\t<title>fromsrc docs</title>
\t</head>
\t<body>
\t\t<div style="display:grid;grid-template-columns:220px 1fr 200px;min-height:100vh;">
\t\t\t<aside style="border-right:1px solid #1c1c1c;padding:24px 16px;">
\t\t\t\t<a href="/docs" style="display:block;color:#fafafa;">getting started</a>
\t\t\t</aside>
\t\t\t<main style="padding:24px;">
\t\t\t\t<article set:html={html} />
\t\t\t</main>
\t\t\t<aside style="border-left:1px solid #1c1c1c;padding:24px 16px;">
\t\t\t\t{links.map((link) => (
\t\t\t\t\t<a href={\`#\${link.id}\`} style="display:block;margin-bottom:8px;color:#737373;">
\t\t\t\t\t\t{link.title}
\t\t\t\t\t</a>
\t\t\t\t))}
\t\t\t</aside>
\t\t</div>
\t</body>
</html>
`

export const astroenv = `/// <reference types="astro/client" />
/// <reference types="vite/client" />

declare module "*.mdx?raw" {
\tconst value: string
\texport default value
}
`

export const rawenv = `/// <reference types="vite/client" />

declare module "*.mdx?raw" {
\tconst value: string
\texport default value
}
`

export const remixviteconfig = `import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"

export default defineConfig({
\tplugins: [remix()],
})
`

export const remixroot = `import {
\tLinks,
\tMeta,
\tOutlet,
\tScripts,
\tScrollRestoration,
} from "@remix-run/react"

export default function Root() {
\treturn (
\t\t<html lang="en">
\t\t\t<head>
\t\t\t\t<meta charSet="utf-8" />
\t\t\t\t<meta name="viewport" content="width=device-width, initial-scale=1" />
\t\t\t\t<Meta />
\t\t\t\t<Links />
\t\t\t</head>
\t\t\t<body>
\t\t\t\t<Outlet />
\t\t\t\t<ScrollRestoration />
\t\t\t\t<Scripts />
\t\t\t</body>
\t\t</html>
\t)
}
`

export const remixrootindex = `import { redirect } from "@remix-run/node"

export async function loader() {
\treturn redirect("/docs")
}

export default function Index() {
\treturn null
}
`

export const remixdocs = `import { marked } from "marked"
import doc from "../../content/docs/index.mdx?raw"

function text(value: string): string {
\treturn value
\t\t.toLowerCase()
\t\t.replace(/\\s+/g, "-")
\t\t.replace(/[^a-z0-9_-]/g, "")
\t\t.replace(/-+/g, "-")
\t\t.replace(/^-|-$/g, "")
}

const links = Array.from(doc.matchAll(/^##\\s+(.+)$/gm))
\t.map((entry) => (entry[1] ?? "").trim())
\t.filter((entry) => entry.length > 0)
\t.map((entry) => ({ id: text(entry), title: entry }))

const html = String(marked.parse(doc))

export default function Docs() {
\treturn (
\t\t<div style={{ display: "grid", gridTemplateColumns: "220px 1fr 200px", minHeight: "100vh", fontFamily: "ui-monospace, monospace" }}>
\t\t\t<aside style={{ borderRight: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t<a href="/docs" style={{ display: "block", color: "#fafafa" }}>
\t\t\t\t\tgetting started
\t\t\t\t</a>
\t\t\t</aside>
\t\t\t<main style={{ padding: 24 }}>
\t\t\t\t<article dangerouslySetInnerHTML={{ __html: html }} />
\t\t\t</main>
\t\t\t<aside style={{ borderLeft: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t{links.map((link) => (
\t\t\t\t\t<a key={link.id} href={\`#\${link.id}\`} style={{ display: "block", marginBottom: 8, color: "#737373" }}>
\t\t\t\t\t\t{link.title}
\t\t\t\t\t</a>
\t\t\t\t))}
\t\t\t</aside>
\t\t</div>
\t)
}
`

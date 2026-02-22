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
					build: "next build",
					start: "next start",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
					next: "^16.0.0",
					"next-mdx-remote": "^5.0.0",
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
					build: "astro build",
					start: "astro preview",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
					astro: "^5.0.0",
					"@astrojs/react": "^4.4.0",
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
					build: "remix vite:build",
					start: "remix-serve ./build/server/index.js",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
					"@remix-run/node": "^2.17.2",
					"@remix-run/react": "^2.17.2",
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
					build: "vite build",
					start: "vite preview",
					typecheck: "tsc --noEmit",
				},
				dependencies: {
					...base.dependencies,
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

export const browserapp = `const docs = [
\t{
\t\tslug: "/docs",
\t\ttitle: "getting started",
\t\tdescription: "build composable docs with full control",
\t\tsections: [
\t\t\t{ id: "install", title: "install", body: "bun add fromsrc" },
\t\t\t{ id: "layout", title: "layout", body: "split primitives and own your ui." },
\t\t],
\t},
\t{
\t\tslug: "/docs/next",
\t\ttitle: "next.js setup",
\t\tdescription: "wire fromsrc into app routes",
\t\tsections: [
\t\t\t{ id: "adapter", title: "adapter", body: "mount AdapterProvider in your root shell." },
\t\t\t{ id: "content", title: "content", body: "keep docs in content/docs and map routes." },
\t\t],
\t},
]

function current() {
\tconst path = window.location.pathname === "/" ? "/docs" : window.location.pathname
\treturn docs.find((doc) => doc.slug === path) ?? docs[0]
}

export function app() {
\tconst doc = current()
\treturn (
\t\t<div style={{ display: "grid", gridTemplateColumns: "220px 1fr 200px", minHeight: "100vh" }}>
\t\t\t<aside style={{ borderRight: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t{docs.map((item) => (
\t\t\t\t\t<a
\t\t\t\t\t\tkey={item.slug}
\t\t\t\t\t\thref={item.slug}
\t\t\t\t\t\tstyle={{ display: "block", marginBottom: 8, color: item.slug === doc.slug ? "#fafafa" : "#737373" }}
\t\t\t\t\t>
\t\t\t\t\t\t{item.title}
\t\t\t\t\t</a>
\t\t\t\t))}
\t\t\t</aside>
\t\t\t<main style={{ padding: 24 }}>
\t\t\t\t<h1 style={{ marginBottom: 8 }}>{doc.title}</h1>
\t\t\t\t<p style={{ color: "#737373", marginBottom: 24 }}>{doc.description}</p>
\t\t\t\t{doc.sections.map((section) => (
\t\t\t\t\t<section key={section.id} id={section.id} style={{ marginBottom: 20 }}>
\t\t\t\t\t\t<h2 style={{ marginBottom: 6 }}>{section.title}</h2>
\t\t\t\t\t\t<p>{section.body}</p>
\t\t\t\t\t</section>
\t\t\t\t))}
\t\t\t</main>
\t\t\t<aside style={{ borderLeft: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t{doc.sections.map((section) => (
\t\t\t\t\t<a key={section.id} href={\`#\${section.id}\`} style={{ display: "block", marginBottom: 8, color: "#737373" }}>
\t\t\t\t\t\t{section.title}
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

export const astroconfig = `import react from "@astrojs/react"
import { defineConfig } from "astro/config"

export default defineConfig({
\tintegrations: [react()],
})
`

export const astropage = `---
import { Shell } from "../components/shell"
---

<Shell client:load />
`

export const astroenv = `/// <reference types="astro/client" />
`

export const astroshell = `const docs = [
\t{
\t\ttitle: "getting started",
\t\tdescription: "build composable docs with full control",
\t\tsections: [
\t\t\t{ id: "install", title: "install", body: "bun add fromsrc" },
\t\t\t{ id: "layout", title: "layout", body: "split primitives and own your ui." },
\t\t],
\t},
]

export function Shell() {
\tconst doc = docs[0]
\treturn (
\t\t<div style={{ display: "grid", gridTemplateColumns: "220px 1fr 200px", minHeight: "100vh", fontFamily: "ui-monospace, monospace" }}>
\t\t\t<aside style={{ borderRight: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t<a href="/docs" style={{ display: "block", color: "#fafafa" }}>
\t\t\t\t\tgetting started
\t\t\t\t</a>
\t\t\t</aside>
\t\t\t<main style={{ padding: 24 }}>
\t\t\t\t<h1 style={{ marginBottom: 8 }}>{doc.title}</h1>
\t\t\t\t<p style={{ color: "#737373", marginBottom: 24 }}>{doc.description}</p>
\t\t\t\t{doc.sections.map((section) => (
\t\t\t\t\t<section key={section.id} id={section.id} style={{ marginBottom: 20 }}>
\t\t\t\t\t\t<h2 style={{ marginBottom: 6 }}>{section.title}</h2>
\t\t\t\t\t\t<p>{section.body}</p>
\t\t\t\t\t</section>
\t\t\t\t))}
\t\t\t</main>
\t\t\t<aside style={{ borderLeft: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t{doc.sections.map((section) => (
\t\t\t\t\t<a key={section.id} href={\`#\${section.id}\`} style={{ display: "block", marginBottom: 8, color: "#737373" }}>
\t\t\t\t\t\t{section.title}
\t\t\t\t\t</a>
\t\t\t\t))}
\t\t\t</aside>
\t\t</div>
\t)
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

export const remixdocs = `const docs = [
\t{
\t\ttitle: "getting started",
\t\tdescription: "build composable docs with full control",
\t\tsections: [
\t\t\t{ id: "install", title: "install", body: "bun add fromsrc" },
\t\t\t{ id: "layout", title: "layout", body: "split primitives and own your ui." },
\t\t],
\t},
]

export default function Docs() {
\tconst doc = docs[0]
\treturn (
\t\t<div style={{ display: "grid", gridTemplateColumns: "220px 1fr 200px", minHeight: "100vh", fontFamily: "ui-monospace, monospace" }}>
\t\t\t<aside style={{ borderRight: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t<a href="/docs" style={{ display: "block", color: "#fafafa" }}>
\t\t\t\t\tgetting started
\t\t\t\t</a>
\t\t\t</aside>
\t\t\t<main style={{ padding: 24 }}>
\t\t\t\t<h1 style={{ marginBottom: 8 }}>{doc.title}</h1>
\t\t\t\t<p style={{ color: "#737373", marginBottom: 24 }}>{doc.description}</p>
\t\t\t\t{doc.sections.map((section) => (
\t\t\t\t\t<section key={section.id} id={section.id} style={{ marginBottom: 20 }}>
\t\t\t\t\t\t<h2 style={{ marginBottom: 6 }}>{section.title}</h2>
\t\t\t\t\t\t<p>{section.body}</p>
\t\t\t\t\t</section>
\t\t\t\t))}
\t\t\t</main>
\t\t\t<aside style={{ borderLeft: "1px solid #1c1c1c", padding: "24px 16px" }}>
\t\t\t\t{doc.sections.map((section) => (
\t\t\t\t\t<a key={section.id} href={\`#\${section.id}\`} style={{ display: "block", marginBottom: 8, color: "#737373" }}>
\t\t\t\t\t\t{section.title}
\t\t\t\t\t</a>
\t\t\t\t))}
\t\t\t</aside>
\t\t</div>
\t)
}
`

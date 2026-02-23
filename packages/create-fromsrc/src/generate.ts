import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { docslayout, docspage, layout, metajson, page, welcomemdx } from "./pages"
import type { Framework } from "./frameworks"
import {
	astroconfig,
	astroindex,
	astroenv,
	astropage,
	browserapp,
	browserentry,
	gitignore,
	globalscss,
	nextglobalscss,
	nextenv,
	packagejson,
	nextconfig,
	postcssconfig,
	remixdocs,
	rawenv,
	remixrootindex,
	remixroot,
	remixviteconfig,
	tailwindconfig,
	tsconfig,
	vitehtml,
} from "./templates"

interface Options {
	name: string
	framework: Framework
}

function validname(name: string): boolean {
	if (!name) return false
	if (name === "." || name === "..") return false
	if (name.includes("/") || name.includes("\\") || name.includes("\0")) return false
	return /^[a-zA-Z0-9._-]+$/.test(name)
}

function write(dir: string, file: string, content: string) {
	const filepath = join(dir, file)
	const parent = join(filepath, "..")
	if (!existsSync(parent)) {
		mkdirSync(parent, { recursive: true })
	}
	writeFileSync(filepath, content)
}

export function generate(options: Options) {
	const { name, framework } = options
	if (!validname(name)) {
		console.log(`\n  invalid project name "${name}"`)
		process.exit(1)
	}
	const target = join(process.cwd(), name)

	if (existsSync(target)) {
		console.log(`\n  directory "${name}" already exists`)
		process.exit(1)
	}

	mkdirSync(target, { recursive: true })
	write(target, "content/docs/index.mdx", welcomemdx)

	write(target, "package.json", packagejson(name, framework))
	write(target, "tsconfig.json", tsconfig(framework))
	write(target, ".gitignore", gitignore)

	if (framework === "next.js") {
		write(target, "next.config.ts", nextconfig)
		write(target, "next-env.d.ts", nextenv)
		write(target, "tailwind.config.ts", tailwindconfig)
		write(target, "postcss.config.mjs", postcssconfig)
		write(target, "app/globals.css", nextglobalscss)
		write(target, "app/layout.tsx", layout)
		write(target, "app/page.tsx", page)
		write(target, "app/docs/layout.tsx", docslayout)
		write(target, "app/docs/[[...slug]]/page.tsx", docspage)
		write(target, "content/docs/_meta.json", metajson)
		return target
	}

	if (framework === "astro") {
		write(target, "astro.config.mjs", astroconfig)
		write(target, "src/pages/index.astro", astroindex)
		write(target, "src/pages/docs.astro", astropage)
		write(target, "src/styles/global.css", globalscss)
		write(target, "src/env.d.ts", astroenv)
		return target
	}

	if (framework === "remix") {
		write(target, "vite.config.ts", remixviteconfig)
		write(target, "env.d.ts", rawenv)
		write(target, "app/root.tsx", remixroot)
		write(target, "app/routes/_index.tsx", remixrootindex)
		write(target, "app/routes/docs.tsx", remixdocs)
		return target
	}

	write(target, "index.html", vitehtml)
	write(target, "src/env.d.ts", rawenv)
	write(target, "src/main.tsx", browserentry())
	write(target, "src/app.tsx", browserapp)
	write(target, "src/globals.css", globalscss)

	return target
}

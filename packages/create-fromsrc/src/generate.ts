import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { docslayout, docspage, layout, metajson, page, welcomemdx } from "./pages"
import {
	astroconfig,
	astropage,
	browserapp,
	browserentry,
	gitignore,
	globalscss,
	type Framework,
	packagejson,
	nextconfig,
	postcssconfig,
	tailwindconfig,
	tsconfig,
	vitehtml,
} from "./templates"

interface Options {
	name: string
	framework: Framework
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
	const target = join(process.cwd(), name)

	if (existsSync(target)) {
		console.log(`\n  directory "${name}" already exists`)
		process.exit(1)
	}

	mkdirSync(target, { recursive: true })

	write(target, "package.json", packagejson(name, framework))
	write(target, "tsconfig.json", tsconfig(framework))
	write(target, ".gitignore", gitignore)
	write(target, "content/docs/index.mdx", welcomemdx)

	if (framework === "next.js") {
		write(target, "next.config.ts", nextconfig)
		write(target, "tailwind.config.ts", tailwindconfig)
		write(target, "postcss.config.mjs", postcssconfig)
		write(target, "app/globals.css", globalscss)
		write(target, "app/layout.tsx", layout)
		write(target, "app/page.tsx", page)
		write(target, "app/docs/layout.tsx", docslayout)
		write(target, "app/docs/[[...slug]]/page.tsx", docspage)
		write(target, "content/docs/_meta.json", metajson)
		return target
	}

	if (framework === "astro") {
		write(target, "astro.config.mjs", astroconfig)
		write(target, "src/pages/index.astro", astropage)
		write(target, "src/styles/global.css", globalscss)
		return target
	}

	write(target, "index.html", vitehtml)
	write(target, "src/main.tsx", browserentry(framework))
	write(target, "src/app.tsx", browserapp)
	write(target, "src/globals.css", globalscss)

	return target
}

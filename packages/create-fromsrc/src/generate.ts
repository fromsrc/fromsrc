import { existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { docslayout, docspage, layout, metajson, page, welcomemdx } from "./pages"
import {
	gitignore,
	globalscss,
	nextconfig,
	packagejson,
	postcssconfig,
	tailwindconfig,
	tsconfig,
} from "./templates"

interface Options {
	name: string
	framework: string
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
	const { name } = options
	const target = join(process.cwd(), name)

	if (existsSync(target)) {
		console.log(`\n  directory "${name}" already exists`)
		process.exit(1)
	}

	mkdirSync(target, { recursive: true })

	write(target, "package.json", packagejson(name))
	write(target, "next.config.ts", nextconfig)
	write(target, "tsconfig.json", tsconfig)
	write(target, "tailwind.config.ts", tailwindconfig)
	write(target, "postcss.config.mjs", postcssconfig)
	write(target, ".gitignore", gitignore)
	write(target, "app/globals.css", globalscss)
	write(target, "app/layout.tsx", layout)
	write(target, "app/page.tsx", page)
	write(target, "app/docs/layout.tsx", docslayout)
	write(target, "app/docs/[[...slug]]/page.tsx", docspage)
	write(target, "content/docs/index.mdx", welcomemdx)
	write(target, "content/docs/_meta.json", metajson)

	return target
}

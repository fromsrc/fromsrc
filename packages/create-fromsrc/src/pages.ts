export const layout = `import "./globals.css"
import type { ReactNode } from "react"

export const metadata = {
\ttitle: "docs",
\tdescription: "documentation powered by fromsrc",
}

export default function Layout({ children }: { children: ReactNode }) {
\treturn (
\t\t<html lang="en">
\t\t\t<body>{children}</body>
\t\t</html>
\t)
}
`

export const page = `import { redirect } from "next/navigation"

export default function Home() {
\tredirect("/docs")
}
`

export const docslayout = `import type { ReactNode } from "react"

export default function DocsLayout({ children }: { children: ReactNode }) {
\treturn (
\t\t<div className="flex min-h-screen">
\t\t\t<aside className="w-56 shrink-0 border-r border-line p-4">
\t\t\t\t<nav>
\t\t\t\t\t<a href="/docs" className="block py-1 text-fg hover:text-accent">
\t\t\t\t\t\tgetting started
\t\t\t\t\t</a>
\t\t\t\t</nav>
\t\t\t</aside>
\t\t\t<main className="flex-1 min-w-0">
\t\t\t\t<div className="flex">
\t\t\t\t\t<article className="flex-1 max-w-3xl px-8 py-12">
\t\t\t\t\t\t{children}
\t\t\t\t\t</article>
\t\t\t\t\t<aside className="hidden xl:block w-48 shrink-0 p-4">
\t\t\t\t\t\t<nav className="sticky top-8 text-xs text-muted">
\t\t\t\t\t\t\t<p className="mb-2 text-dim uppercase tracking-wide">on this page</p>
\t\t\t\t\t\t</nav>
\t\t\t\t\t</aside>
\t\t\t\t</div>
\t\t\t</main>
\t\t</div>
\t)
}
`

export const docspage = `import { readFileSync } from "node:fs"
import { join } from "node:path"
import { MDXRemote } from "next-mdx-remote/rsc"

interface Props {
\tparams: Promise<{ slug?: string[] }>
}

export default async function DocPage({ params }: Props) {
\tconst { slug } = await params
\tconst path = slug?.join("/") || "index"
\tconst direct = join(process.cwd(), "content", "docs", \`\${path}.mdx\`)
\tconst nested = join(process.cwd(), "content", "docs", path, "index.mdx")

\tlet content: string
\ttry {
\t\tcontent = readFileSync(direct, "utf-8")
\t} catch {
\t\ttry {
\t\t\tcontent = readFileSync(nested, "utf-8")
\t\t} catch {
\t\t\treturn <p>not found</p>
\t\t}
\t}

\tconst lines = content.split("\\n")
\tlet title = ""
\tlet body = content

\tif (lines[0] === "---") {
\t\tconst end = lines.indexOf("---", 1)
\t\tif (end !== -1) {
\t\t\tfor (let i = 1; i < end; i++) {
\t\t\t\tconst line = lines[i]!
\t\t\t\tif (line.startsWith("title:")) {
\t\t\t\t\ttitle = line.slice(6).trim()
\t\t\t\t}
\t\t\t}
\t\t\tbody = lines.slice(end + 1).join("\\n").trim()
\t\t}
\t}

\treturn (
\t\t<div className="prose">
\t\t\t{title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
\t\t\t<MDXRemote source={body} />
\t\t</div>
\t)
}
`

export const welcomemdx = `---
title: getting started
description: learn how to use fromsrc
---

# getting started

welcome to your documentation site.

## installation

\`\`\`bash
bun add fromsrc
\`\`\`

## next steps

- add mdx files to \`content/docs/\`
- customize the sidebar
- deploy to vercel
`

export const metajson = JSON.stringify(
	{
		pages: ["index"],
	},
	null,
	"\t",
)

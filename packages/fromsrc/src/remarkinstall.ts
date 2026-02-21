import type { Code, Root } from "mdast"
import type { Plugin } from "unified"
import { visit } from "unist-util-visit"

function attribute(name: string, value: string) {
	return { type: "mdxJsxAttribute", name, value }
}

type installelement = {
	type: "mdxJsxFlowElement"
	name: "Install"
	attributes: ReturnType<typeof attribute>[]
	children: []
	data: { _mdxExplicitJsx: true }
}

function commands(pkg: string, dev: boolean) {
	if (dev) {
		return {
			npm: `npm install -D ${pkg}`,
			yarn: `yarn add -D ${pkg}`,
			pnpm: `pnpm add -D ${pkg}`,
			bun: `bun add -d ${pkg}`,
		}
	}
	return {
		npm: `npm install ${pkg}`,
		yarn: `yarn add ${pkg}`,
		pnpm: `pnpm add ${pkg}`,
		bun: `bun add ${pkg}`,
	}
}

function transformer(tree: Root) {
	visit(tree, "code", (node: Code, index, parent) => {
		if (!parent || index === undefined) return

		const isInstall =
			node.lang === "install" || (node.meta && node.meta.includes("install"))
		if (!isInstall) return

		const raw = node.value.trim()
		if (!raw) return

		const dev =
			raw.includes("--dev") || raw.includes("-D") || (node.meta?.includes("dev") ?? false)
		const pkg = raw
			.split(/\s+/)
			.filter((w) => w !== "--dev" && w !== "-D")
			.join(" ")

		if (!pkg) return

		const cmds = commands(pkg, dev)
		const attrs = [
			attribute("packages", pkg),
			attribute("npm", cmds.npm),
			attribute("yarn", cmds.yarn),
			attribute("pnpm", cmds.pnpm),
			attribute("bun", cmds.bun),
		]

		const element: installelement = {
			type: "mdxJsxFlowElement",
			name: "Install",
			attributes: attrs,
			children: [],
			data: { _mdxExplicitJsx: true },
		}
		parent.children[index] = element as unknown as Root["children"][number]
	})
}

export const remarkInstall: Plugin<[], Root> = () => transformer

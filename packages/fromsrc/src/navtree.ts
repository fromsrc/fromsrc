import type { DocMeta } from "./content"

export interface NavNode {
	title: string
	slug: string
	href?: string
	children: NavNode[]
	order?: number
	icon?: string
	badge?: string
}

export interface NavTreeConfig {
	docs: DocMeta[]
	basePath?: string
	collapsible?: boolean
}

function titleize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ")
}

export function buildNavTree(config: NavTreeConfig): NavNode[] {
	const { docs, basePath = "/docs" } = config
	const root: NavNode[] = []
	const map = new Map<string, NavNode>()
	const sorted = [...docs].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

	for (const doc of sorted) {
		const segments = doc.slug.split("/").filter(Boolean)
		if (segments.length === 0) {
			const node: NavNode = {
				title: doc.title, slug: doc.slug, href: basePath,
				children: [], order: doc.order,
			}
			map.set("", node)
			root.push(node)
			continue
		}
		let parentChildren = root
		let path = ""
		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i]
			if (!segment) continue
			path = path ? `${path}/${segment}` : segment
			const isLast = i === segments.length - 1
			let existing = map.get(path)
			if (!existing) {
				existing = {
					title: isLast ? doc.title : titleize(segment),
					slug: path,
					href: isLast ? `${basePath}/${path}` : undefined,
					children: [],
					order: isLast ? doc.order : undefined,
				}
				map.set(path, existing)
				parentChildren.push(existing)
			} else if (isLast) {
				existing.title = doc.title
				existing.href = `${basePath}/${path}`
				existing.order = doc.order
			}
			parentChildren = existing.children
		}
	}

	function sortNodes(nodes: NavNode[]) {
		nodes.sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
		for (const node of nodes) if (node.children.length > 0) sortNodes(node.children)
	}
	sortNodes(root)
	return root
}

export function flattenNavTree(nodes: NavNode[]): NavNode[] {
	const result: NavNode[] = []
	for (const node of nodes) {
		result.push(node)
		if (node.children.length > 0) result.push(...flattenNavTree(node.children))
	}
	return result
}

export function findNavNode(nodes: NavNode[], slug: string): NavNode | null {
	for (const node of nodes) {
		if (node.slug === slug) return node
		const found = findNavNode(node.children, slug)
		if (found) return found
	}
	return null
}

export function getNavBreadcrumbs(nodes: NavNode[], slug: string): NavNode[] {
	function walk(current: NavNode[], path: NavNode[]): NavNode[] | null {
		for (const node of current) {
			const next = [...path, node]
			if (node.slug === slug) return next
			const found = walk(node.children, next)
			if (found) return found
		}
		return null
	}
	return walk(nodes, []) ?? []
}

export function getPrevNext(nodes: NavNode[], slug: string) {
	const flat = flattenNavTree(nodes).filter((n) => n.href)
	const i = flat.findIndex((n) => n.slug === slug)
	if (i === -1) return { prev: null as NavNode | null, next: null as NavNode | null }
	const prev = i > 0 ? flat[i - 1] ?? null : null
	const next = i < flat.length - 1 ? flat[i + 1] ?? null : null
	return { prev, next }
}

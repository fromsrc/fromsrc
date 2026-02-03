"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import type { DocMeta } from "../content"

function sortDocs(docs: DocMeta[]): DocMeta[] {
	const intro: DocMeta[] = []
	const components: DocMeta[] = []
	const api: DocMeta[] = []
	const other: DocMeta[] = []

	for (const doc of docs) {
		if (doc.slug.startsWith("components/")) {
			components.push(doc)
		} else if (doc.slug.startsWith("api/")) {
			api.push(doc)
		} else if (!doc.slug || doc.slug.match(/^[^/]+$/)) {
			intro.push(doc)
		} else {
			other.push(doc)
		}
	}

	const sortByOrder = (a: DocMeta, b: DocMeta) => (a.order ?? 999) - (b.order ?? 999)
	return [
		...intro.sort(sortByOrder),
		...components.sort(sortByOrder),
		...api.sort(sortByOrder),
		...other.sort(sortByOrder),
	]
}

export function useKeyboardNav(docs: DocMeta[], basePath = "/docs") {
	const pathname = usePathname()
	const router = useRouter()

	useEffect(() => {
		const sorted = sortDocs(docs)
		const paths = sorted.map((d) => (d.slug ? `${basePath}/${d.slug}` : basePath))
		const current = paths.indexOf(pathname)

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
			if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return

			if (e.key === "ArrowRight" && current < paths.length - 1) {
				e.preventDefault()
				router.push(paths[current + 1])
			}
			if (e.key === "ArrowLeft" && current > 0) {
				e.preventDefault()
				router.push(paths[current - 1])
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [docs, pathname, router, basePath])
}

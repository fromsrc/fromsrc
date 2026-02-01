"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { DocMeta } from "../content"

export function useKeyboardNav(docs: DocMeta[], basePath = "/docs") {
	const pathname = usePathname()
	const router = useRouter()

	useEffect(() => {
		const sorted = [...docs].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
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

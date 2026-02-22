"use client"

import { useEffect, useState } from "react"

export interface ScrollSpyOptions {
	offset?: number
	threshold?: number
}

/**
 * Hook for tracking which section is currently in view
 * @param ids - Array of element IDs to observe
 * @param options - Configuration for offset and threshold
 * @returns The ID of the currently active section or null
 */
export function useScrollSpy(ids: string[], options: ScrollSpyOptions = {}): string | null {
	const { offset = 100, threshold = 0.5 } = options
	const [activeId, setActiveId] = useState<string | null>(null)

	useEffect(() => {
		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null)

		if (elements.length === 0) return

		function handleScroll() {
			const scrollTop = window.scrollY + offset
			const viewport = window.innerHeight * threshold

			let currentId: string | null = null
			for (const el of elements) {
				if (el.offsetTop <= scrollTop + viewport) {
					currentId = el.id
				}
			}

			setActiveId(currentId)
		}

		handleScroll()
		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [ids, offset, threshold])

	return activeId
}

"use client"

import { useEffect, useState } from "react"

/**
 * Tracks whether the user is at the top of the page
 * @returns true when scroll position is less than 10px from the top
 */
export function useIsScrollTop(): boolean {
	const [atTop, setAtTop] = useState(true)

	useEffect(() => {
		const handle = () => {
			setAtTop(window.scrollY < 10)
		}

		handle()
		window.addEventListener("scroll", handle, { passive: true })

		return () => {
			window.removeEventListener("scroll", handle)
		}
	}, [])

	return atTop
}

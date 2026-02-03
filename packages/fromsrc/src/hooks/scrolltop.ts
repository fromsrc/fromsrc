"use client"

import { useEffect, useState } from "react"

/**
 * Returns true when the user is at the top of the page (scroll < 10px)
 */
export function useIsScrollTop() {
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

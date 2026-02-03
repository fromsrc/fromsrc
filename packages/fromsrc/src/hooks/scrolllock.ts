"use client"

import { useEffect } from "react"

/**
 * Locks page scrolling by setting body overflow to hidden
 * @param locked - Whether scrolling should be locked
 */
export function useScrollLock(locked: boolean): void {
	useEffect(() => {
		if (!locked) return

		const prev = document.body.style.overflow
		document.body.style.overflow = "hidden"

		return () => {
			document.body.style.overflow = prev
		}
	}, [locked])
}

"use client"

import { useEffect, useRef } from "react"

export function usePageLeave(callback: () => void): void {
	const saved = useRef(callback)
	saved.current = callback

	useEffect(() => {
		function handler(e: MouseEvent) {
			if (e.clientY <= 0) {
				saved.current()
			}
		}

		document.addEventListener("mouseleave", handler)
		return () => document.removeEventListener("mouseleave", handler)
	}, [])
}

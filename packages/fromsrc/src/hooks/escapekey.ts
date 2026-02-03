"use client"

import { useEffect } from "react"

export function useEscapeKey(handler: () => void, enabled = true) {
	useEffect(() => {
		if (!enabled) return

		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") {
				e.preventDefault()
				handler()
			}
		}

		document.addEventListener("keydown", handleKey)
		return () => document.removeEventListener("keydown", handleKey)
	}, [handler, enabled])
}

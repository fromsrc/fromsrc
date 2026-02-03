"use client"

import { useEffect } from "react"

/**
 * Triggers a callback when the Escape key is pressed
 * @param handler - Callback invoked when Escape is pressed
 * @param enabled - Whether the listener is active (default: true)
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
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

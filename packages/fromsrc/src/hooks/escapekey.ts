"use client"

import { useCallback } from "react"
import { useEventListener } from "./eventlistener"

/**
 * Triggers a callback when the Escape key is pressed
 * @param handler - Callback invoked when Escape is pressed
 * @param enabled - Whether the listener is active (default: true)
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
	const handleKey = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault()
				handler()
			}
		},
		[handler]
	)

	useEventListener(document, "keydown", handleKey, enabled)
}

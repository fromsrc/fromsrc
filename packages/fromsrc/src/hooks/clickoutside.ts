"use client"

import { type RefObject, useCallback } from "react"
import { useEventListener } from "./eventlistener"

/**
 * Triggers a callback when clicking outside the referenced element
 * @param ref - Reference to the element to detect clicks outside of
 * @param handler - Callback invoked when a click occurs outside the element
 * @param enabled - Whether the listener is active (default: true)
 */
export function useClickOutside<T extends HTMLElement>(
	ref: RefObject<T | null>,
	handler: () => void,
	enabled = true
): void {
	const handleClick = useCallback(
		(e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				handler()
			}
		},
		[ref, handler]
	)

	useEventListener(typeof document !== "undefined" ? document : null, "click", handleClick, enabled)
}

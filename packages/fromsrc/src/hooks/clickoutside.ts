"use client"

import { useEffect, type RefObject } from "react"

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
	useEffect(() => {
		if (!enabled) return

		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				handler()
			}
		}

		document.addEventListener("click", handleClick)
		return () => document.removeEventListener("click", handleClick)
	}, [ref, handler, enabled])
}

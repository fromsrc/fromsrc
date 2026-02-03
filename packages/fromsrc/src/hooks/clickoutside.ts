"use client"

import { useEffect, type RefObject } from "react"

export function useClickOutside<T extends HTMLElement>(
	ref: RefObject<T | null>,
	handler: () => void,
	enabled = true
) {
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

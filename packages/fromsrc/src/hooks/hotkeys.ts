"use client"

import { useEffect, useRef } from "react"

export interface HotkeyBinding {
	key: string
	ctrl?: boolean
	meta?: boolean
	shift?: boolean
	alt?: boolean
	handler: () => void
}

function matches(e: KeyboardEvent, binding: HotkeyBinding): boolean {
	if (e.key.toLowerCase() !== binding.key.toLowerCase()) return false
	if (binding.ctrl && !e.ctrlKey) return false
	if (binding.meta && !e.metaKey) return false
	if (binding.shift && !e.shiftKey) return false
	if (binding.alt && !e.altKey) return false
	return true
}

export function useHotkeys(bindings: HotkeyBinding[]): void {
	const ref = useRef(bindings)
	ref.current = bindings

	useEffect(() => {
		function handle(e: KeyboardEvent) {
			const target = e.target as HTMLElement
			if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
				return
			}

			for (const binding of ref.current) {
				if (matches(e, binding)) {
					e.preventDefault()
					binding.handler()
					return
				}
			}
		}

		window.addEventListener("keydown", handle)
		return () => window.removeEventListener("keydown", handle)
	}, [])
}

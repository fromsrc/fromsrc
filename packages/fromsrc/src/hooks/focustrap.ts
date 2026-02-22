"use client"

import { type RefObject, useCallback, useEffect, useRef } from "react"

export const FOCUSABLE_SELECTOR =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export interface FocusTrapOptions {
	enabled: boolean
	onEscape?: () => void
	autoFocus?: boolean
	restoreFocus?: boolean
}

export function useFocusTrap<T extends HTMLElement>(
	ref: RefObject<T | null>,
	options: FocusTrapOptions
): void {
	const { enabled, onEscape, autoFocus = true, restoreFocus = true } = options
	const previousFocus = useRef<HTMLElement | null>(null)

	const getFocusableElements = useCallback((): HTMLElement[] => {
		if (!ref.current) return []
		return Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
	}, [ref])

	const handleKeyDown = useCallback(
		(e: KeyboardEvent): void => {
			if (e.key === "Escape" && onEscape) {
				onEscape()
				return
			}

			if (e.key !== "Tab") return

			const focusable = getFocusableElements()
			if (focusable.length === 0) return

			const first = focusable[0]
			const last = focusable[focusable.length - 1]

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault()
				last?.focus()
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault()
				first?.focus()
			}
		},
		[onEscape, getFocusableElements]
	)

	useEffect(() => {
		if (!enabled) return

		previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
		document.addEventListener("keydown", handleKeyDown)

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
			if (restoreFocus) {
				previousFocus.current?.focus()
			}
		}
	}, [enabled, handleKeyDown, restoreFocus])

	useEffect(() => {
		if (!enabled || !autoFocus) return

		const focusable = getFocusableElements()
		focusable[0]?.focus()
	}, [enabled, autoFocus, getFocusableElements])

	useEffect(() => {
		if (!enabled) return

		const handleFocusIn = (e: FocusEvent): void => {
			if (!(e.target instanceof Node) || !ref.current?.contains(e.target)) {
				const focusable = getFocusableElements()
				focusable[0]?.focus()
			}
		}

		document.addEventListener("focusin", handleFocusIn)
		return () => document.removeEventListener("focusin", handleFocusIn)
	}, [enabled, ref, getFocusableElements])
}

"use client"

import { useCallback, useState } from "react"

export type ToggleResult = [
	open: boolean,
	toggle: () => void,
	setOpen: React.Dispatch<React.SetStateAction<boolean>>,
]

/**
 * Hook for managing toggle state
 * @param defaultOpen - Initial open state (default: false)
 * @returns Tuple of [open, toggle, setOpen]
 */
export function useToggle(defaultOpen: boolean = false): ToggleResult {
	const [open, setOpen] = useState(defaultOpen)

	const toggle = useCallback(() => setOpen((prev) => !prev), [])

	return [open, toggle, setOpen]
}

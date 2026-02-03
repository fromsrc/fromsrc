"use client"

import { useEffect, useState } from "react"

/**
 * Debounce a value by delaying updates until after a specified delay.
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value that updates after the delay
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debounced, setDebounced] = useState<T>(value)

	useEffect((): (() => void) => {
		const timer: ReturnType<typeof setTimeout> = setTimeout(
			(): void => setDebounced(value),
			delay,
		)
		return (): void => clearTimeout(timer)
	}, [value, delay])

	return debounced
}

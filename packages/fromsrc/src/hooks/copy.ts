"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface CopyResult {
	copied: boolean
	copy: (text: string) => Promise<void>
}

/**
 * Hook for copying text to clipboard with automatic reset
 * @param duration - Time in ms before copied state resets (default: 1500)
 * @returns Object with copied state and copy function
 */
export function useCopy(duration: number = 1500): CopyResult {
	const [copied, setCopied] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const copy = useCallback(
		async (text: string) => {
			try {
				await navigator.clipboard.writeText(text)
				setCopied(true)
				if (timeoutRef.current) clearTimeout(timeoutRef.current)
				timeoutRef.current = setTimeout(() => setCopied(false), duration)
			} catch {
				setCopied(false)
			}
		},
		[duration],
	)

	return { copied, copy }
}

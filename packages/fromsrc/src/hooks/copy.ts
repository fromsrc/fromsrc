"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface CopyResult {
	copied: boolean
	copy: (text: string) => Promise<void>
}

export function useCopy(duration = 1500): CopyResult {
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

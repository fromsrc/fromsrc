"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface ShareData {
	title?: string
	text?: string
	url?: string
}

export interface ShareResult {
	shared: boolean
	share: (data: ShareData) => void
	canShare: boolean
}

export function useShare(duration: number = 1500): ShareResult {
	const [shared, setShared] = useState(false)
	const [canShare] = useState(() => typeof navigator !== "undefined" && !!navigator.share)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const share = useCallback(
		async (data: ShareData) => {
			try {
				if (canShare && navigator.share) {
					await navigator.share(data)
					setShared(true)
					if (timeoutRef.current) clearTimeout(timeoutRef.current)
					timeoutRef.current = setTimeout(() => setShared(false), duration)
				} else {
					const fallback = data.url || data.text || ""
					await navigator.clipboard.writeText(fallback)
					setShared(true)
					if (timeoutRef.current) clearTimeout(timeoutRef.current)
					timeoutRef.current = setTimeout(() => setShared(false), duration)
				}
			} catch {
				setShared(false)
			}
		},
		[canShare, duration],
	)

	return { shared, share, canShare }
}

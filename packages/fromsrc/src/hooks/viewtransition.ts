"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export interface ViewTransitionResult {
	startTransition: (callback: () => void) => void
	isTransitioning: boolean
	supported: boolean
}

export function useViewTransition(): ViewTransitionResult {
	const [isTransitioning, setIsTransitioning] = useState(false)
	const supported = typeof document !== "undefined" && "startViewTransition" in document

	const startTransition = useCallback(
		(callback: () => void) => {
			if (!supported) {
				callback()
				return
			}
			setIsTransitioning(true)
			const transition = (document as any).startViewTransition(callback)
			transition.finished.finally(() => setIsTransitioning(false))
		},
		[supported],
	)

	return { startTransition, isTransitioning, supported }
}

export function usePageTransition(): void {
	const pathname = usePathname()
	const previous = useRef(pathname)
	const supported = typeof document !== "undefined" && "startViewTransition" in document

	useEffect(() => {
		if (!supported || pathname === previous.current) return
		previous.current = pathname
		;(document as any).startViewTransition(() => {})
	}, [pathname, supported])
}

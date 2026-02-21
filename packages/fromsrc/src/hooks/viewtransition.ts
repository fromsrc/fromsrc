"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

export interface ViewTransitionResult {
	startTransition: (callback: () => void) => void
	isTransitioning: boolean
	supported: boolean
}

interface transition {
	finished: Promise<void>
}

type transitiondocument = Document & { startViewTransition?: (action: () => void) => transition }

export function useViewTransition(): ViewTransitionResult {
	const [isTransitioning, setIsTransitioning] = useState(false)
	const supported =
		typeof document !== "undefined" &&
		typeof (document as transitiondocument).startViewTransition === "function"

	const startTransition = useCallback(
		(callback: () => void) => {
			if (!supported) {
				callback()
				return
			}
			setIsTransitioning(true)
			const transition = (document as transitiondocument).startViewTransition?.(callback)
			if (!transition) {
				setIsTransitioning(false)
				return
			}
			transition.finished.finally(() => setIsTransitioning(false))
		},
		[supported],
	)

	return { startTransition, isTransitioning, supported }
}

export function usePageTransition(): void {
	const pathname = usePathname()
	const previous = useRef(pathname)
	const supported =
		typeof document !== "undefined" &&
		typeof (document as transitiondocument).startViewTransition === "function"

	useEffect(() => {
		if (!supported || pathname === previous.current) return
		previous.current = pathname
		;(document as transitiondocument).startViewTransition?.(() => {})
	}, [pathname, supported])
}

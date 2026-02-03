"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false)

	useEffect(() => {
		const mq = window.matchMedia(query)
		setMatches(mq.matches)

		function handleChange(e: MediaQueryListEvent) {
			setMatches(e.matches)
		}

		mq.addEventListener("change", handleChange)
		return () => mq.removeEventListener("change", handleChange)
	}, [query])

	return matches
}

export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 768px)")
}

export function useIsTablet(): boolean {
	return useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
}

export function useIsDesktop(): boolean {
	return useMediaQuery("(min-width: 1025px)")
}

export function usePrefersDark(): boolean {
	return useMediaQuery("(prefers-color-scheme: dark)")
}

export function usePrefersReducedMotion(): boolean {
	return useMediaQuery("(prefers-reduced-motion: reduce)")
}

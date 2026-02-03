"use client"

import { useEffect, useState } from "react"

/**
 * Subscribe to a CSS media query and track its match state.
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns Whether the media query currently matches
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState<boolean>(false)

	useEffect(() => {
		const mq: MediaQueryList = window.matchMedia(query)
		setMatches(mq.matches)

		function handleChange(e: MediaQueryListEvent): void {
			setMatches(e.matches)
		}

		mq.addEventListener("change", handleChange)
		return (): void => {
			mq.removeEventListener("change", handleChange)
		}
	}, [query])

	return matches
}

/**
 * Check if viewport is mobile sized (max-width: 768px).
 * @returns Whether the viewport matches mobile breakpoint
 */
export function useIsMobile(): boolean {
	return useMediaQuery("(max-width: 768px)")
}

/**
 * Check if viewport is tablet sized (769px to 1024px).
 * @returns Whether the viewport matches tablet breakpoint
 */
export function useIsTablet(): boolean {
	return useMediaQuery("(min-width: 769px) and (max-width: 1024px)")
}

/**
 * Check if viewport is desktop sized (min-width: 1025px).
 * @returns Whether the viewport matches desktop breakpoint
 */
export function useIsDesktop(): boolean {
	return useMediaQuery("(min-width: 1025px)")
}

/**
 * Check if user prefers dark color scheme.
 * @returns Whether the user prefers dark mode
 */
export function usePrefersDark(): boolean {
	return useMediaQuery("(prefers-color-scheme: dark)")
}

/**
 * Check if user prefers reduced motion.
 * @returns Whether the user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
	return useMediaQuery("(prefers-reduced-motion: reduce)")
}

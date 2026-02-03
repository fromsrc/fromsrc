"use client"

import { memo, useCallback, useEffect, useState } from "react"
import type { JSX } from "react"

/**
 * Props for the BackToTop component.
 */
export interface BackToTopProps {
	/**
	 * Scroll threshold in pixels before the button appears.
	 */
	threshold?: number
	/**
	 * Additional CSS classes to apply to the button.
	 */
	className?: string
}

function BackToTopBase({ threshold = 400, className }: BackToTopProps): JSX.Element | null {
	const [visible, setVisible] = useState<boolean>(false)

	useEffect((): (() => void) => {
		function check(): void {
			setVisible(window.scrollY > threshold)
		}
		check()
		window.addEventListener("scroll", check, { passive: true })
		return (): void => window.removeEventListener("scroll", check)
	}, [threshold])

	const scrollToTop = useCallback((): void => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}, [])

	if (!visible) return null

	return (
		<button
			type="button"
			onClick={scrollToTop}
			className={`fixed bottom-6 right-6 p-3 bg-surface border border-line rounded-full shadow-lg hover:bg-bg transition-all z-50 ${className || ""}`}
			aria-label="back to top"
		>
			<svg
				aria-hidden="true"
				className="size-4 text-fg"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
			</svg>
		</button>
	)
}

export const BackToTop = memo(BackToTopBase)

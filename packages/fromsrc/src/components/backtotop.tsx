"use client"

import { useState, useEffect } from "react"

interface Props {
	threshold?: number
	className?: string
}

export function BackToTop({ threshold = 400, className }: Props) {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		function check() {
			setVisible(window.scrollY > threshold)
		}
		check()
		window.addEventListener("scroll", check, { passive: true })
		return () => window.removeEventListener("scroll", check)
	}, [threshold])

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}

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

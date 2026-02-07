"use client"

import { useEffect, useRef, useState } from "react"

export type ScrollDirection = "up" | "down" | null

export function useScrollDirection(threshold = 10): ScrollDirection {
	const [direction, setDirection] = useState<ScrollDirection>(null)
	const last = useRef(0)
	const ticking = useRef(false)

	useEffect(() => {
		last.current = window.scrollY

		const update = () => {
			const current = window.scrollY
			const diff = current - last.current

			if (Math.abs(diff) >= threshold) {
				setDirection(diff > 0 ? "down" : "up")
				last.current = current
			}

			ticking.current = false
		}

		const handle = () => {
			if (!ticking.current) {
				ticking.current = true
				requestAnimationFrame(update)
			}
		}

		window.addEventListener("scroll", handle, { passive: true })

		return () => {
			window.removeEventListener("scroll", handle)
		}
	}, [threshold])

	return direction
}

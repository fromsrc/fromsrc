"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface ReadProgressOptions {
	containerRef?: React.RefObject<HTMLElement | null>
}

export function useReadProgress(options?: ReadProgressOptions): number {
	const [progress, setProgress] = useState<number>(0)
	const rafRef = useRef<number>(0)

	const handleScroll = useCallback((): void => {
		if (rafRef.current) return

		rafRef.current = requestAnimationFrame((): void => {
			const container = options?.containerRef?.current
			const element = container || document.documentElement

			const scrollTop = container ? container.scrollTop : element.scrollTop
			const scrollHeight = element.scrollHeight - (container ? container.clientHeight : window.innerHeight)
			const newProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
			const clamped = Math.min(100, Math.max(0, newProgress))

			setProgress(clamped)
			rafRef.current = 0
		})
	}, [options?.containerRef])

	useEffect((): (() => void) => {
		const target = options?.containerRef?.current || window

		handleScroll()
		target.addEventListener("scroll", handleScroll, { passive: true })

		return (): void => {
			target.removeEventListener("scroll", handleScroll)
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
		}
	}, [handleScroll, options?.containerRef])

	return progress
}

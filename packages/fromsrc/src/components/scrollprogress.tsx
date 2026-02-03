"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import type { JSX } from "react"

export interface ScrollProgressProps {
	color?: string
	height?: number
	label?: string
}

function ScrollProgressBase({
	color = "var(--accent)",
	height = 2,
	label = "Page scroll progress",
}: ScrollProgressProps): JSX.Element {
	const [progress, setProgress] = useState<number>(0)
	const rafRef = useRef<number>(0)

	const handleScroll = useCallback((): void => {
		if (rafRef.current) return

		rafRef.current = requestAnimationFrame((): void => {
			const scrollTop = document.documentElement.scrollTop
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
			const newProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
			setProgress(newProgress)
			rafRef.current = 0
		})
	}, [])

	useEffect((): (() => void) => {
		handleScroll()
		window.addEventListener("scroll", handleScroll, { passive: true })
		return (): void => {
			window.removeEventListener("scroll", handleScroll)
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
		}
	}, [handleScroll])

	const rounded = Math.round(progress)

	return (
		<div
			className="fixed left-0 top-0 z-50 w-full"
			style={{ height }}
			role="progressbar"
			aria-valuenow={rounded}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={label}
		>
			<div
				className="h-full transition-[width] duration-100"
				style={{
					width: `${progress}%`,
					backgroundColor: color,
				}}
			/>
		</div>
	)
}

export const ScrollProgress = memo(ScrollProgressBase)

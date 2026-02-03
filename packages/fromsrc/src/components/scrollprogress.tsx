"use client"

import { useEffect, useState } from "react"

export interface ScrollProgressProps {
	color?: string
	height?: number
}

export function ScrollProgress({ color = "var(--accent)", height = 2 }: ScrollProgressProps) {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		function handleScroll() {
			const scrollTop = document.documentElement.scrollTop
			const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
			const newProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
			setProgress(newProgress)
		}

		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return (
		<div
			className="fixed left-0 top-0 z-50 w-full"
			style={{ height }}
			role="progressbar"
			aria-valuenow={Math.round(progress)}
			aria-valuemin={0}
			aria-valuemax={100}
		>
			<div
				className="h-full transition-all duration-100"
				style={{
					width: `${progress}%`,
					backgroundColor: color,
				}}
			/>
		</div>
	)
}

"use client"

import { useEffect, useState } from "react"

export function Progress() {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		function handle() {
			const { scrollTop, scrollHeight, clientHeight } = document.documentElement
			const percent = scrollTop / (scrollHeight - clientHeight) * 100
			setProgress(Math.min(100, Math.max(0, percent)))
		}
		window.addEventListener("scroll", handle, { passive: true })
		handle()
		return () => window.removeEventListener("scroll", handle)
	}, [])

	return (
		<div
			className="fixed top-0 left-0 right-0 z-50 h-[2px] origin-left bg-accent"
			style={{
				transform: `scaleX(${progress / 100})`,
				transition: "transform 150ms ease-out",
			}}
		/>
	)
}

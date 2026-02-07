"use client"

import { useEffect, useRef, useState } from "react"

export function useIdle(timeout: number = 60000): boolean {
	const [idle, setIdle] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		function reset() {
			setIdle(false)
			if (timer.current) clearTimeout(timer.current)
			timer.current = setTimeout(() => setIdle(true), timeout)
		}

		const events = ["mousemove", "keydown", "scroll", "touchstart", "click"] as const
		for (const event of events) {
			window.addEventListener(event, reset, { passive: true })
		}

		reset()

		return () => {
			for (const event of events) {
				window.removeEventListener(event, reset)
			}
			if (timer.current) clearTimeout(timer.current)
		}
	}, [timeout])

	return idle
}

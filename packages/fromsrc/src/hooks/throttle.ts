"use client"

import { useEffect, useRef, useState } from "react"

export function useThrottle<T>(value: T, ms: number): T {
	const [throttled, setThrottled] = useState(value)
	const lastRef = useRef(Date.now())
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		const now = Date.now()
		const elapsed = now - lastRef.current

		if (elapsed >= ms) {
			lastRef.current = now
			setThrottled(value)
		} else {
			if (timerRef.current) clearTimeout(timerRef.current)
			timerRef.current = setTimeout(() => {
				lastRef.current = Date.now()
				setThrottled(value)
			}, ms - elapsed)
		}

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		}
	}, [value, ms])

	return throttled
}

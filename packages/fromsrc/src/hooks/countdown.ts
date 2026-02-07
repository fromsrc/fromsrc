"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface CountdownResult {
	remaining: number
	running: boolean
	start: () => void
	pause: () => void
	reset: () => void
}

export function useCountdown(seconds: number): CountdownResult {
	const [remaining, setRemaining] = useState(seconds)
	const [running, setRunning] = useState(false)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const clear = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}, [])

	const start = useCallback(() => {
		clear()
		setRunning(true)
		intervalRef.current = setInterval(() => {
			setRemaining((prev) => {
				if (prev <= 1) {
					clear()
					setRunning(false)
					return 0
				}
				return prev - 1
			})
		}, 1000)
	}, [clear])

	const pause = useCallback(() => {
		clear()
		setRunning(false)
	}, [clear])

	const reset = useCallback(() => {
		clear()
		setRunning(false)
		setRemaining(seconds)
	}, [clear, seconds])

	useEffect(() => clear, [clear])

	return { remaining, running, start, pause, reset }
}

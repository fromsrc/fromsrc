"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface WakeLockResult {
	active: boolean
	supported: boolean
	request: () => Promise<void>
	release: () => Promise<void>
}

interface wakesentinel {
	release: () => Promise<void>
	addEventListener: (type: "release", listener: () => void) => void
}

type wakelockapi = {
	request: (type: "screen") => Promise<wakesentinel>
}

type wakelocknavigator = Navigator & { wakeLock?: wakelockapi }

export function useWakeLock(): WakeLockResult {
	const [active, setActive] = useState(false)
	const supported = typeof navigator !== "undefined" && "wakeLock" in navigator
	const sentinelRef = useRef<wakesentinel | null>(null)

	const request = useCallback(async () => {
		if (!supported) return
		try {
			const lock = (navigator as wakelocknavigator).wakeLock
			if (!lock) return
			sentinelRef.current = await lock.request("screen")
			sentinelRef.current.addEventListener("release", () => setActive(false))
			setActive(true)
		} catch {}
	}, [supported])

	const release = useCallback(async () => {
		await sentinelRef.current?.release()
		sentinelRef.current = null
		setActive(false)
	}, [])

	useEffect(() => {
		return () => {
			sentinelRef.current?.release()
		}
	}, [])

	return { active, supported, request, release }
}

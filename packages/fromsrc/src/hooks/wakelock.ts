"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface WakeLockResult {
	active: boolean
	supported: boolean
	request: () => Promise<void>
	release: () => Promise<void>
}

export function useWakeLock(): WakeLockResult {
	const [active, setActive] = useState(false)
	const supported = typeof navigator !== "undefined" && "wakeLock" in navigator
	const sentinelRef = useRef<any>(null)

	const request = useCallback(async () => {
		if (!supported) return
		try {
			sentinelRef.current = await navigator.wakeLock.request("screen")
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

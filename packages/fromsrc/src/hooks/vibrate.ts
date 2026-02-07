"use client"

import { useCallback } from "react"

export interface VibrateResult {
	supported: boolean
	vibrate: (pattern?: number | number[]) => void
}

export function useVibrate(): VibrateResult {
	const supported = typeof navigator !== "undefined" && "vibrate" in navigator

	const vibrate = useCallback(
		(pattern: number | number[] = 200) => {
			if (supported) navigator.vibrate(pattern)
		},
		[supported],
	)

	return { supported, vibrate }
}

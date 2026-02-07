"use client"

import { useCallback, useState } from "react"

export interface EyeDropperResult {
	color: string | null
	supported: boolean
	pick: () => Promise<string | null>
}

export function useEyeDropper(): EyeDropperResult {
	const [color, setColor] = useState<string | null>(null)
	const supported = typeof window !== "undefined" && "EyeDropper" in window

	const pick = useCallback(async () => {
		if (!supported) return null
		try {
			const dropper = new (window as any).EyeDropper()
			const result = await dropper.open()
			setColor(result.sRGBHex)
			return result.sRGBHex as string
		} catch {
			return null
		}
	}, [supported])

	return { color, supported, pick }
}

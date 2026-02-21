"use client"

import { useCallback, useState } from "react"

export interface EyeDropperResult {
	color: string | null
	supported: boolean
	pick: () => Promise<string | null>
}

interface eyedropperresult {
	sRGBHex: string
}

interface eyedropperapi {
	open: () => Promise<eyedropperresult>
}

type eyedropperctor = new () => eyedropperapi
type eyedropperwindow = Window & { EyeDropper?: eyedropperctor }

export function useEyeDropper(): EyeDropperResult {
	const [color, setColor] = useState<string | null>(null)
	const supported = typeof window !== "undefined" && "EyeDropper" in window

	const pick = useCallback(async () => {
		if (!supported) return null
		try {
			const Dropper = (window as eyedropperwindow).EyeDropper
			if (!Dropper) return null
			const dropper = new Dropper()
			const result = await dropper.open()
			setColor(result.sRGBHex)
			return result.sRGBHex
		} catch {
			return null
		}
	}, [supported])

	return { color, supported, pick }
}

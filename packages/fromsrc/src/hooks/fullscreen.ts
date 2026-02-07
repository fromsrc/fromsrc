"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface FullscreenResult {
	isFullscreen: boolean
	enter: () => Promise<void>
	exit: () => Promise<void>
	toggle: () => Promise<void>
	ref: React.RefObject<HTMLElement | null>
}

export function useFullscreen(): FullscreenResult {
	const ref = useRef<HTMLElement | null>(null)
	const [isFullscreen, setIsFullscreen] = useState(false)

	useEffect(() => {
		function handler() {
			setIsFullscreen(!!document.fullscreenElement)
		}
		document.addEventListener("fullscreenchange", handler)
		return () => document.removeEventListener("fullscreenchange", handler)
	}, [])

	const enter = useCallback(async () => {
		if (ref.current && !document.fullscreenElement) {
			await ref.current.requestFullscreen()
		}
	}, [])

	const exit = useCallback(async () => {
		if (document.fullscreenElement) {
			await document.exitFullscreen()
		}
	}, [])

	const toggle = useCallback(async () => {
		if (document.fullscreenElement) {
			await document.exitFullscreen()
		} else if (ref.current) {
			await ref.current.requestFullscreen()
		}
	}, [])

	return { isFullscreen, enter, exit, toggle, ref }
}

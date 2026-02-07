"use client"

import { useCallback, useRef } from "react"

export interface LongPressHandlers {
	onMouseDown: (e: React.MouseEvent) => void
	onMouseUp: () => void
	onMouseLeave: () => void
	onTouchStart: (e: React.TouchEvent) => void
	onTouchEnd: () => void
}

export function useLongPress(callback: () => void, delay = 500): LongPressHandlers {
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const start = useCallback(() => {
		timer.current = setTimeout(callback, delay)
	}, [callback, delay])

	const cancel = useCallback(() => {
		if (timer.current) {
			clearTimeout(timer.current)
			timer.current = null
		}
	}, [])

	return {
		onMouseDown: start,
		onMouseUp: cancel,
		onMouseLeave: cancel,
		onTouchStart: start,
		onTouchEnd: cancel,
	}
}

"use client"

import { useCallback, useRef, useState } from "react"

export interface Rect {
	x: number
	y: number
	width: number
	height: number
	top: number
	right: number
	bottom: number
	left: number
}

const empty: Rect = { x: 0, y: 0, width: 0, height: 0, top: 0, right: 0, bottom: 0, left: 0 }

export function useMeasure<T extends HTMLElement>(): [
	(node: T | null) => void,
	Rect,
] {
	const [rect, setRect] = useState<Rect>(empty)
	const observerRef = useRef<ResizeObserver | null>(null)

	const ref = useCallback((node: T | null) => {
		if (observerRef.current) {
			observerRef.current.disconnect()
			observerRef.current = null
		}

		if (node) {
			const observer = new ResizeObserver(() => {
				const r = node.getBoundingClientRect()
				setRect({
					x: r.x,
					y: r.y,
					width: r.width,
					height: r.height,
					top: r.top,
					right: r.right,
					bottom: r.bottom,
					left: r.left,
				})
			})
			observer.observe(node)
			observerRef.current = observer
		}
	}, [])

	return [ref, rect]
}

"use client"

import { useEffect, useRef, useState } from "react"

export interface ElementSize {
	width: number
	height: number
}

export function useResizeObserver<T extends HTMLElement>(): [
	React.RefObject<T | null>,
	ElementSize,
] {
	const ref = useRef<T | null>(null)
	const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 })

	useEffect(() => {
		const el = ref.current
		if (!el) return

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0]
			if (entry) {
				setSize({
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				})
			}
		})

		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return [ref, size]
}

"use client"

import { useEffect, useRef, useState } from "react"

export function useHover<T extends HTMLElement>(): [React.RefObject<T | null>, boolean] {
	const ref = useRef<T | null>(null)
	const [hovered, setHovered] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return

		const enter = () => setHovered(true)
		const leave = () => setHovered(false)

		el.addEventListener("mouseenter", enter)
		el.addEventListener("mouseleave", leave)
		return () => {
			el.removeEventListener("mouseenter", enter)
			el.removeEventListener("mouseleave", leave)
		}
	}, [])

	return [ref, hovered]
}

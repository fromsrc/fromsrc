"use client"

import { useEffect, useState } from "react"

export type ColorScheme = "light" | "dark"

export function useColorScheme(): ColorScheme {
	const [scheme, setScheme] = useState<ColorScheme>("light")

	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)")
		setScheme(mq.matches ? "dark" : "light")

		function handler(e: MediaQueryListEvent) {
			setScheme(e.matches ? "dark" : "light")
		}

		mq.addEventListener("change", handler)
		return () => mq.removeEventListener("change", handler)
	}, [])

	return scheme
}

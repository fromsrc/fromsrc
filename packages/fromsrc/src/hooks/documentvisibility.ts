"use client"

import { useEffect, useState } from "react"

export type VisibilityState = "visible" | "hidden"

function tovisibility(value: string): VisibilityState {
	return value === "hidden" ? "hidden" : "visible"
}

export function useDocumentVisibility(): VisibilityState {
	const [state, setState] = useState<VisibilityState>("visible")

	useEffect(() => {
		function handler() {
			setState(tovisibility(document.visibilityState))
		}

		document.addEventListener("visibilitychange", handler)
		return () => document.removeEventListener("visibilitychange", handler)
	}, [])

	return state
}

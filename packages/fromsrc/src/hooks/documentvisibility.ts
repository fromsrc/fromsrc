"use client"

import { useEffect, useState } from "react"

export type VisibilityState = "visible" | "hidden"

export function useDocumentVisibility(): VisibilityState {
	const [state, setState] = useState<VisibilityState>("visible")

	useEffect(() => {
		function handler() {
			setState(document.visibilityState as VisibilityState)
		}

		document.addEventListener("visibilitychange", handler)
		return () => document.removeEventListener("visibilitychange", handler)
	}, [])

	return state
}

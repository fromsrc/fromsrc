"use client"

import { useEffect, useState } from "react"

export interface TextSelection {
	text: string
	rect: DOMRect | null
}

export function useTextSelection(): TextSelection {
	const [selection, setSelection] = useState<TextSelection>({ text: "", rect: null })

	useEffect(() => {
		function handler() {
			const sel = window.getSelection()
			const text = sel?.toString() ?? ""
			if (!text) {
				setSelection({ text: "", rect: null })
				return
			}
			const range = sel?.getRangeAt(0)
			const rect = range?.getBoundingClientRect() ?? null
			setSelection({ text, rect })
		}

		document.addEventListener("selectionchange", handler)
		return () => document.removeEventListener("selectionchange", handler)
	}, [])

	return selection
}

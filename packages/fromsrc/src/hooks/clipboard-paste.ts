"use client"

import { useEffect, useState } from "react"

export interface PasteData {
	text: string | null
	files: File[]
	timestamp: number
}

export function useClipboardPaste(): PasteData {
	const [data, setData] = useState<PasteData>({ text: null, files: [], timestamp: 0 })

	useEffect(() => {
		function handler(e: ClipboardEvent) {
			const text = e.clipboardData?.getData("text/plain") ?? null
			const files = Array.from(e.clipboardData?.files ?? [])
			setData({ text, files, timestamp: Date.now() })
		}

		document.addEventListener("paste", handler)
		return () => document.removeEventListener("paste", handler)
	}, [])

	return data
}

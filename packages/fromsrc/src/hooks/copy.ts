"use client"

import { useCallback, useState } from "react"

export function useCopy(duration = 1500) {
	const [copied, setCopied] = useState(false)

	const copy = useCallback(
		async (text: string) => {
			await navigator.clipboard.writeText(text)
			setCopied(true)
			setTimeout(() => setCopied(false), duration)
		},
		[duration],
	)

	return { copied, copy }
}

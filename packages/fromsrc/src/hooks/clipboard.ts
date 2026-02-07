import { useCallback, useEffect, useRef, useState } from "react"

export type ClipboardResult = {
	copy: (text: string) => Promise<void>
	paste: () => Promise<string>
	copied: boolean
	supported: boolean
}

export function useClipboard(timeout = 2000): ClipboardResult {
	const [copied, setCopied] = useState(false)
	const timer = useRef<ReturnType<typeof setTimeout>>(null)
	const supported = typeof navigator !== "undefined" && !!navigator.clipboard

	const copy = useCallback(async (text: string) => {
		await navigator.clipboard.writeText(text)
		setCopied(true)
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setCopied(false), timeout)
	}, [timeout])

	const paste = useCallback(async () => {
		return navigator.clipboard.readText()
	}, [])

	useEffect(() => {
		return () => {
			if (timer.current) clearTimeout(timer.current)
		}
	}, [])

	return { copy, paste, copied, supported }
}

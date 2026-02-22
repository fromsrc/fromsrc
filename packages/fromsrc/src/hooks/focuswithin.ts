"use client"

import { useEffect, useRef, useState } from "react"

export function useFocusWithin<T extends HTMLElement>(): [
	React.RefObject<T | null>,
	boolean,
] {
	const ref = useRef<T | null>(null)
	const [focused, setFocused] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return

		const onFocusIn = () => setFocused(true)
		const onFocusOut = (e: FocusEvent) => {
			if (!(e.relatedTarget instanceof Node) || !el.contains(e.relatedTarget)) setFocused(false)
		}

		el.addEventListener("focusin", onFocusIn)
		el.addEventListener("focusout", onFocusOut)
		return () => {
			el.removeEventListener("focusin", onFocusIn)
			el.removeEventListener("focusout", onFocusOut)
		}
	}, [])

	return [ref, focused]
}

"use client"

import { useEffect, useRef } from "react"

export function useDocumentTitle(title: string, restoreOnUnmount = false): void {
	const previous = useRef<string>("")

	useEffect(() => {
		previous.current = document.title
		document.title = title
	}, [title])

	useEffect(() => {
		if (restoreOnUnmount) {
			const saved = previous.current
			return () => {
				document.title = saved
			}
		}
	}, [restoreOnUnmount])
}

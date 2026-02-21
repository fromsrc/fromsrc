"use client"

import { useEffect } from "react"

let count = 0
let saved = ""

function lock(): void {
	if (count === 0) {
		saved = document.body.style.overflow
		document.body.style.overflow = "hidden"
	}
	count += 1
}

function unlock(): void {
	if (count === 0) return
	count -= 1
	if (count === 0) {
		document.body.style.overflow = saved
		saved = ""
	}
}

export function useScrollLock(locked: boolean): void {
	useEffect(() => {
		if (!locked) return

		lock()
		return () => unlock()
	}, [locked])
}

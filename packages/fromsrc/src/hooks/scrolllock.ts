"use client"

import { useEffect } from "react"

const countkey = "data-fromsrc-scroll-count"
const savekey = "data-fromsrc-scroll-value"

function getcount(): number {
	return Number(document.body.getAttribute(countkey) ?? "0")
}

function setcount(value: number): void {
	document.body.setAttribute(countkey, String(value))
}

function lock(): void {
	const count = getcount()
	if (count === 0) {
		document.body.setAttribute(savekey, document.body.style.overflow)
		document.body.style.overflow = "hidden"
	}
	setcount(count + 1)
}

function unlock(): void {
	const count = getcount()
	if (count === 0) return
	const next = count - 1
	setcount(next)
	if (next === 0) {
		document.body.style.overflow = document.body.getAttribute(savekey) ?? ""
		document.body.removeAttribute(savekey)
	}
}

export function useScrollLock(locked: boolean): void {
	useEffect(() => {
		if (!locked) return

		lock()
		return () => unlock()
	}, [locked])
}

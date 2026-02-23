"use client"

import { useEffect, useState } from "react"

function current(): string {
	if (typeof window === "undefined") {
		return "/"
	}
	return window.location.pathname
}

export function usepath(): string {
	const [value, setValue] = useState(current)

	useEffect(() => {
		if (typeof window === "undefined") {
			return
		}
		const update = () => setValue(window.location.pathname)
		update()
		window.addEventListener("popstate", update)
		window.addEventListener("hashchange", update)
		window.addEventListener("astro:page-load", update as EventListener)
		return () => {
			window.removeEventListener("popstate", update)
			window.removeEventListener("hashchange", update)
			window.removeEventListener("astro:page-load", update as EventListener)
		}
	}, [])

	return value
}

export function push(url: string): void {
	if (typeof window === "undefined") {
		return
	}
	let target: URL
	try {
		target = new URL(url, window.location.href)
	} catch {
		return
	}
	if (target.origin !== window.location.origin) {
		window.location.assign(target.toString())
		return
	}
	window.history.pushState({}, "", target.toString())
	window.dispatchEvent(new PopStateEvent("popstate"))
}

export function back(): void {
	if (typeof window === "undefined") {
		return
	}
	window.history.back()
}

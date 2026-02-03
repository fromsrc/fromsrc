"use client"

import { useEffect } from "react"

export interface AnchorOptions {
	offset?: number
	smooth?: boolean
}

export function useAnchorScroll(options: AnchorOptions = {}) {
	const { offset = 80, smooth = true } = options

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			const target = e.target as HTMLElement
			const anchor = target.closest("a")

			if (!anchor) return
			const href = anchor.getAttribute("href")
			if (!href?.startsWith("#")) return

			const id = href.slice(1)
			const element = document.getElementById(id)
			if (!element) return

			e.preventDefault()

			const top = element.offsetTop - offset
			window.scrollTo({
				top: Math.max(0, top),
				behavior: smooth ? "smooth" : "auto",
			})

			window.history.pushState(null, "", href)
		}

		document.addEventListener("click", handleClick)
		return () => document.removeEventListener("click", handleClick)
	}, [offset, smooth])

	useEffect(() => {
		const hash = window.location.hash
		if (!hash) return

		const id = hash.slice(1)
		const element = document.getElementById(id)
		if (!element) return

		setTimeout(() => {
			const top = element.offsetTop - offset
			window.scrollTo({
				top: Math.max(0, top),
				behavior: "auto",
			})
		}, 100)
	}, [offset])
}

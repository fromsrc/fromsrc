"use client"

import { useEffect } from "react"

function HeadingCopy() {
	useEffect(() => {
		function handler(e: MouseEvent) {
			const target = e.target as HTMLElement
			if (!target.classList.contains("heading-anchor-icon")) return
			e.preventDefault()
			const anchor = target.closest("a")
			if (!anchor) return
			const id = anchor.getAttribute("href")?.replace("#", "")
			if (!id) return
			const url = window.location.origin + window.location.pathname + "#" + id
			navigator.clipboard.writeText(url).then(() => {
				const original = target.textContent
				target.textContent = "\u2713"
				setTimeout(() => {
					target.textContent = original
				}, 1500)
			})
		}
		document.addEventListener("click", handler)
		return () => document.removeEventListener("click", handler)
	}, [])
	return null
}

export { HeadingCopy }

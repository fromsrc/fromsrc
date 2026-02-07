"use client"

import { useEffect } from "react"

export function useFavicon(href: string): void {
	useEffect(() => {
		const link =
			(document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
			document.createElement("link")
		link.type = "image/x-icon"
		link.rel = "shortcut icon"
		link.href = href
		document.head.appendChild(link)
	}, [href])
}

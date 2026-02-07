"use client"

import { useEffect, useState } from "react"

export type StylesheetStatus = "idle" | "loading" | "ready" | "error"

export function useStylesheet(href: string | null): StylesheetStatus {
	const [status, setStatus] = useState<StylesheetStatus>(href ? "loading" : "idle")

	useEffect(() => {
		if (!href) {
			setStatus("idle")
			return
		}

		const existing = document.querySelector(`link[href="${href}"]`)
		if (existing) {
			setStatus("ready")
			return
		}

		const link = document.createElement("link")
		link.rel = "stylesheet"
		link.href = href
		link.onload = () => setStatus("ready")
		link.onerror = () => setStatus("error")
		document.head.appendChild(link)
		setStatus("loading")

		return () => {
			document.head.removeChild(link)
		}
	}, [href])

	return status
}

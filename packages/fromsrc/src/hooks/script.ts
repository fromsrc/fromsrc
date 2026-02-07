"use client"

import { useEffect, useState } from "react"

export type ScriptStatus = "idle" | "loading" | "ready" | "error"

export function useScript(src: string | null): ScriptStatus {
	const [status, setStatus] = useState<ScriptStatus>(src ? "loading" : "idle")

	useEffect(() => {
		if (!src) {
			setStatus("idle")
			return
		}

		const existing = document.querySelector(`script[src="${src}"]`)
		if (existing) {
			setStatus("ready")
			return
		}

		const script = document.createElement("script")
		script.src = src
		script.async = true
		script.onload = () => setStatus("ready")
		script.onerror = () => setStatus("error")
		document.body.appendChild(script)
		setStatus("loading")

		return () => {
			document.body.removeChild(script)
		}
	}, [src])

	return status
}

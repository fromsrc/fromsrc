"use client"

import { useEffect, useState } from "react"

export type PermissionName =
	| "camera"
	| "microphone"
	| "geolocation"
	| "notifications"
	| "clipboard-read"
	| "clipboard-write"

export type PermissionState = "granted" | "denied" | "prompt" | "unknown"

export function usePermission(name: PermissionName): PermissionState {
	const [state, setState] = useState<PermissionState>("unknown")

	useEffect(() => {
		if (typeof navigator === "undefined" || !navigator.permissions) {
			return
		}

		let mounted = true

		navigator.permissions
			.query({ name: name as any })
			.then((status) => {
				if (!mounted) return
				setState(status.state as PermissionState)
				status.addEventListener("change", () => {
					if (mounted) setState(status.state as PermissionState)
				})
			})
			.catch(() => {})

		return () => {
			mounted = false
		}
	}, [name])

	return state
}

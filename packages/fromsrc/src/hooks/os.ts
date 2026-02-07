"use client"

import { useMemo } from "react"

export type Platform = "mac" | "windows" | "linux" | "unknown"

export function useOs(): Platform {
	return useMemo(() => {
		if (typeof navigator === "undefined") return "unknown"
		const ua = navigator.userAgent.toLowerCase()
		if (ua.includes("mac")) return "mac"
		if (ua.includes("win")) return "windows"
		if (ua.includes("linux")) return "linux"
		return "unknown"
	}, [])
}

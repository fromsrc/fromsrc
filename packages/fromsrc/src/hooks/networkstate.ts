"use client"

import { useEffect, useState } from "react"

export interface NetworkState {
	online: boolean
	downlink?: number
	effectiveType?: string
	rtt?: number
	saveData?: boolean
}

function getState(): NetworkState {
	if (typeof navigator === "undefined") return { online: true }
	const conn = (navigator as any).connection
	return {
		online: navigator.onLine,
		downlink: conn?.downlink,
		effectiveType: conn?.effectiveType,
		rtt: conn?.rtt,
		saveData: conn?.saveData,
	}
}

export function useNetworkState(): NetworkState {
	const [state, setState] = useState<NetworkState>(getState)

	useEffect(() => {
		function update() {
			setState(getState())
		}

		window.addEventListener("online", update)
		window.addEventListener("offline", update)
		const conn = (navigator as any).connection
		if (conn) {
			conn.addEventListener("change", update)
		}

		return () => {
			window.removeEventListener("online", update)
			window.removeEventListener("offline", update)
			if (conn) {
				conn.removeEventListener("change", update)
			}
		}
	}, [])

	return state
}

"use client"

import { useEffect, useState } from "react"

export interface BatteryState {
	charging: boolean
	level: number
	supported: boolean
}

export function useBattery(): BatteryState {
	const [state, setState] = useState<BatteryState>({
		charging: false,
		level: 1,
		supported: false,
	})

	useEffect(() => {
		if (typeof navigator === "undefined" || !("getBattery" in navigator)) return

		let battery: any

		;(navigator as any).getBattery().then((b: any) => {
			battery = b
			const update = () => {
				setState({ charging: b.charging, level: b.level, supported: true })
			}
			update()
			b.addEventListener("chargingchange", update)
			b.addEventListener("levelchange", update)
		})

		return () => {
			if (battery) {
				battery.removeEventListener("chargingchange", () => {})
				battery.removeEventListener("levelchange", () => {})
			}
		}
	}, [])

	return state
}

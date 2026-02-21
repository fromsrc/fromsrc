"use client"

import { useEffect, useState } from "react"

export interface BatteryState {
	charging: boolean
	level: number
	supported: boolean
}

type batteryevent = "chargingchange" | "levelchange"

interface batterymanager {
	charging: boolean
	level: number
	addEventListener: (type: batteryevent, listener: () => void) => void
	removeEventListener: (type: batteryevent, listener: () => void) => void
}

type batterynavigator = Navigator & { getBattery?: () => Promise<batterymanager> }

export function useBattery(): BatteryState {
	const [state, setState] = useState<BatteryState>({
		charging: false,
		level: 1,
		supported: false,
	})

	useEffect(() => {
		const nav = navigator as batterynavigator
		if (typeof navigator === "undefined" || typeof nav.getBattery !== "function") return

		let battery: batterymanager | null = null
		const update = () => {
			if (!battery) return
			setState({ charging: battery.charging, level: battery.level, supported: true })
		}

		nav.getBattery().then((b) => {
			battery = b
			update()
			b.addEventListener("chargingchange", update)
			b.addEventListener("levelchange", update)
		})

		return () => {
			if (battery) {
				battery.removeEventListener("chargingchange", update)
				battery.removeEventListener("levelchange", update)
			}
		}
	}, [])

	return state
}

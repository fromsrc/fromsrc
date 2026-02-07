"use client"

import { useEffect, useState } from "react"

export interface DeviceOrientation {
	alpha: number | null
	beta: number | null
	gamma: number | null
}

export function useOrientation(): DeviceOrientation {
	const [orientation, setOrientation] = useState<DeviceOrientation>({
		alpha: null,
		beta: null,
		gamma: null,
	})

	useEffect(() => {
		function handler(e: DeviceOrientationEvent) {
			setOrientation({ alpha: e.alpha, beta: e.beta, gamma: e.gamma })
		}

		window.addEventListener("deviceorientation", handler)
		return () => window.removeEventListener("deviceorientation", handler)
	}, [])

	return orientation
}

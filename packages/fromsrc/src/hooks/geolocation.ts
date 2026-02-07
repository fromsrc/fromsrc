"use client"

import { useCallback, useEffect, useState } from "react"

export interface GeoPosition {
	latitude: number | null
	longitude: number | null
	accuracy: number | null
	loading: boolean
	error: string | null
}

export function useGeolocation(watch = false): GeoPosition {
	const [pos, setPos] = useState<GeoPosition>({
		latitude: null,
		longitude: null,
		accuracy: null,
		loading: true,
		error: null,
	})

	const onSuccess = useCallback((p: GeolocationPosition) => {
		setPos({
			latitude: p.coords.latitude,
			longitude: p.coords.longitude,
			accuracy: p.coords.accuracy,
			loading: false,
			error: null,
		})
	}, [])

	const onError = useCallback((e: GeolocationPositionError) => {
		setPos((prev) => ({ ...prev, loading: false, error: e.message }))
	}, [])

	useEffect(() => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			setPos((prev) => ({ ...prev, loading: false, error: "unsupported" }))
			return
		}

		navigator.geolocation.getCurrentPosition(onSuccess, onError)

		if (watch) {
			const id = navigator.geolocation.watchPosition(onSuccess, onError)
			return () => navigator.geolocation.clearWatch(id)
		}
	}, [watch, onSuccess, onError])

	return pos
}

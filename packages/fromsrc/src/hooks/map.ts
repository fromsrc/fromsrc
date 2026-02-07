"use client"

import { useCallback, useState } from "react"

export interface MapResult<K, V> {
	map: Map<K, V>
	set: (key: K, value: V) => void
	remove: (key: K) => void
	has: (key: K) => boolean
	get: (key: K) => V | undefined
	clear: () => void
	reset: () => void
}

export function useMap<K, V>(initial?: Iterable<[K, V]>): MapResult<K, V> {
	const [map, setMap] = useState(() => new Map<K, V>(initial))

	const set = useCallback((key: K, value: V) => {
		setMap((prev) => new Map(prev).set(key, value))
	}, [])

	const remove = useCallback((key: K) => {
		setMap((prev) => {
			const next = new Map(prev)
			next.delete(key)
			return next
		})
	}, [])

	const has = useCallback((key: K) => map.has(key), [map])
	const get = useCallback((key: K) => map.get(key), [map])
	const clear = useCallback(() => setMap(new Map()), [])
	const reset = useCallback(() => setMap(new Map(initial)), [initial])

	return { map, set, remove, has, get, clear, reset }
}

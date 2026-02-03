"use client"

import { useCallback, useEffect, useState } from "react"

export function useLocalStorage<T>(
	key: string,
	defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
	const [value, setValue] = useState<T>(defaultValue)

	useEffect(() => {
		try {
			const stored = localStorage.getItem(key)
			if (stored !== null) {
				setValue(JSON.parse(stored))
			}
		} catch {
			// ignore
		}
	}, [key])

	const setStoredValue = useCallback(
		(newValue: T | ((prev: T) => T)) => {
			setValue((prev) => {
				const resolved = newValue instanceof Function ? newValue(prev) : newValue
				try {
					localStorage.setItem(key, JSON.stringify(resolved))
				} catch {
					// ignore
				}
				return resolved
			})
		},
		[key],
	)

	return [value, setStoredValue]
}

export function useSessionStorage<T>(
	key: string,
	defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
	const [value, setValue] = useState<T>(defaultValue)

	useEffect(() => {
		try {
			const stored = sessionStorage.getItem(key)
			if (stored !== null) {
				setValue(JSON.parse(stored))
			}
		} catch {
			// ignore
		}
	}, [key])

	const setStoredValue = useCallback(
		(newValue: T | ((prev: T) => T)) => {
			setValue((prev) => {
				const resolved = newValue instanceof Function ? newValue(prev) : newValue
				try {
					sessionStorage.setItem(key, JSON.stringify(resolved))
				} catch {
					// ignore
				}
				return resolved
			})
		},
		[key],
	)

	return [value, setStoredValue]
}

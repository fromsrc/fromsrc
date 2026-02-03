"use client"

import { useCallback, useEffect, useState } from "react"

type StorageSetter<T> = (value: T | ((prev: T) => T)) => void

/**
 * Persist state to localStorage with automatic JSON serialization.
 * @param key - Storage key to use
 * @param defaultValue - Initial value if no stored value exists
 * @returns Tuple of current value and setter function
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, StorageSetter<T>] {
	const [value, setValue] = useState<T>(defaultValue)

	useEffect((): void => {
		try {
			const stored: string | null = localStorage.getItem(key)
			if (stored !== null) {
				setValue(JSON.parse(stored) as T)
			}
		} catch {
			// ignore
		}
	}, [key])

	const setStoredValue: StorageSetter<T> = useCallback(
		(newValue: T | ((prev: T) => T)): void => {
			setValue((prev: T): T => {
				const resolved: T = newValue instanceof Function ? newValue(prev) : newValue
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

/**
 * Persist state to sessionStorage with automatic JSON serialization.
 * @param key - Storage key to use
 * @param defaultValue - Initial value if no stored value exists
 * @returns Tuple of current value and setter function
 */
export function useSessionStorage<T>(key: string, defaultValue: T): [T, StorageSetter<T>] {
	const [value, setValue] = useState<T>(defaultValue)

	useEffect((): void => {
		try {
			const stored: string | null = sessionStorage.getItem(key)
			if (stored !== null) {
				setValue(JSON.parse(stored) as T)
			}
		} catch {
			// ignore
		}
	}, [key])

	const setStoredValue: StorageSetter<T> = useCallback(
		(newValue: T | ((prev: T) => T)): void => {
			setValue((prev: T): T => {
				const resolved: T = newValue instanceof Function ? newValue(prev) : newValue
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

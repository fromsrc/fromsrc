"use client"

import { useCallback, useEffect, useState } from "react"

type StorageSetter<T> = (value: T | ((prev: T) => T)) => void

/**
 * Factory function to create storage hooks for different storage backends.
 * @param getStorage - Function that returns the storage object (localStorage or sessionStorage)
 * @returns A hook function for persisting state to the specified storage
 */
function useStorage<T>(
	getStorage: () => Storage,
	key: string,
	defaultValue: T,
): [T, StorageSetter<T>] {
	const [value, setValue] = useState<T>(defaultValue)

	useEffect((): void => {
		try {
			const stored: string | null = getStorage().getItem(key)
			if (stored !== null) {
				setValue(JSON.parse(stored) as T)
			}
		} catch {
					}
	}, [getStorage, key])

	const setStoredValue: StorageSetter<T> = useCallback(
		(newValue: T | ((prev: T) => T)): void => {
			setValue((prev: T): T => {
				const resolved: T = newValue instanceof Function ? newValue(prev) : newValue
				try {
					getStorage().setItem(key, JSON.stringify(resolved))
				} catch {
									}
				return resolved
			})
		},
		[getStorage, key],
	)

	return [value, setStoredValue]
}

/**
 * Persist state to localStorage with automatic JSON serialization.
 * @param key - Storage key to use
 * @param defaultValue - Initial value if no stored value exists
 * @returns Tuple of current value and setter function
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, StorageSetter<T>] {
	return useStorage<T>(() => localStorage, key, defaultValue)
}

/**
 * Persist state to sessionStorage with automatic JSON serialization.
 * @param key - Storage key to use
 * @param defaultValue - Initial value if no stored value exists
 * @returns Tuple of current value and setter function
 */
export function useSessionStorage<T>(key: string, defaultValue: T): [T, StorageSetter<T>] {
	return useStorage<T>(() => sessionStorage, key, defaultValue)
}

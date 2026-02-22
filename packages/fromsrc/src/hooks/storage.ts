"use client"

import { useCallback, useEffect, useState } from "react"

type StorageSetter<T> = (value: T | ((prev: T) => T)) => void
const local = (): Storage => localStorage
const session = (): Storage => sessionStorage

function issamekind<T>(value: unknown, sample: T): value is T {
	if (sample === null) return value === null
	if (Array.isArray(sample)) return Array.isArray(value)
	const kind = typeof sample
	if (kind === "object") {
		return typeof value === "object" && value !== null && !Array.isArray(value)
	}
	return typeof value === kind
}

function parsestored<T>(raw: string, fallback: T): T | null {
	try {
		const parsed: unknown = JSON.parse(raw)
		return issamekind(parsed, fallback) ? parsed : null
	} catch {
		return null
	}
}

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
				const parsed = parsestored(stored, defaultValue)
				if (parsed !== null) setValue(parsed)
			}
		} catch {
		}
	}, [defaultValue, getStorage, key])

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

export function useLocalStorage<T>(key: string, defaultValue: T): [T, StorageSetter<T>] {
	return useStorage<T>(local, key, defaultValue)
}

export function useSessionStorage<T>(key: string, defaultValue: T): [T, StorageSetter<T>] {
	return useStorage<T>(session, key, defaultValue)
}

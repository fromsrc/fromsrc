"use client"

import { useCallback, useState } from "react"

export interface AsyncState<T, Args extends unknown[]> {
	data: T | null
	error: Error | null
	loading: boolean
	execute: (...args: Args) => Promise<T | null>
}

export function useAsync<T, Args extends unknown[]>(fn: (...args: Args) => Promise<T>): AsyncState<T, Args> {
	const [data, setData] = useState<T | null>(null)
	const [error, setError] = useState<Error | null>(null)
	const [loading, setLoading] = useState(false)

	const execute = useCallback(
		async (...args: Args) => {
			setLoading(true)
			setError(null)
			try {
				const result = await fn(...args)
				setData(result)
				setLoading(false)
				return result
			} catch (e) {
				setError(e instanceof Error ? e : new Error(String(e)))
				setLoading(false)
				return null
			}
		},
		[fn],
	)

	return { data, error, loading, execute }
}

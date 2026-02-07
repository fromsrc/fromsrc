"use client"

import { useEffect, useState } from "react"

export interface FetchState<T> {
	data: T | null
	error: Error | null
	loading: boolean
}

export function useFetch<T>(url: string | null, options?: RequestInit): FetchState<T> {
	const [state, setState] = useState<FetchState<T>>({
		data: null,
		error: null,
		loading: !!url,
	})

	useEffect(() => {
		if (!url) return

		let cancelled = false
		setState({ data: null, error: null, loading: true })

		fetch(url, options)
			.then((res) => {
				if (!res.ok) throw new Error(res.statusText)
				return res.json()
			})
			.then((data) => {
				if (!cancelled) setState({ data, error: null, loading: false })
			})
			.catch((error) => {
				if (!cancelled) setState({ data: null, error, loading: false })
			})

		return () => {
			cancelled = true
		}
	}, [url])

	return state
}

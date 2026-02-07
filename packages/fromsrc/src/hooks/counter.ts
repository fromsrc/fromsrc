"use client"

import { useCallback, useState } from "react"

export interface CounterResult {
	count: number
	increment: () => void
	decrement: () => void
	reset: () => void
	set: (value: number) => void
}

export function useCounter(initial = 0): CounterResult {
	const [count, setCount] = useState(initial)

	const increment = useCallback(() => setCount((c) => c + 1), [])
	const decrement = useCallback(() => setCount((c) => c - 1), [])
	const reset = useCallback(() => setCount(initial), [initial])

	return { count, increment, decrement, reset, set: setCount }
}

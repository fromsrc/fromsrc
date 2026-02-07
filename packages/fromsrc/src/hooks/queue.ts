"use client"

import { useCallback, useState } from "react"

export interface QueueResult<T> {
	items: T[]
	size: number
	enqueue: (item: T) => void
	dequeue: () => T | undefined
	peek: () => T | undefined
	clear: () => void
}

export function useQueue<T>(initial: T[] = []): QueueResult<T> {
	const [items, setItems] = useState<T[]>(initial)

	const enqueue = useCallback((item: T) => {
		setItems((prev) => [...prev, item])
	}, [])

	const dequeue = useCallback(() => {
		let removed: T | undefined
		setItems((prev) => {
			if (prev.length === 0) return prev
			removed = prev[0]
			return prev.slice(1)
		})
		return removed
	}, [])

	const peek = useCallback(() => items[0], [items])
	const clear = useCallback(() => setItems([]), [])

	return { items, size: items.length, enqueue, dequeue, peek, clear }
}

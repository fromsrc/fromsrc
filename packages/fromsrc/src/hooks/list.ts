"use client"

import { useCallback, useState } from "react"

export interface ListResult<T> {
	items: T[]
	set: (items: T[]) => void
	push: (item: T) => void
	removeAt: (index: number) => void
	updateAt: (index: number, item: T) => void
	insertAt: (index: number, item: T) => void
	clear: () => void
	filter: (fn: (item: T) => boolean) => void
	sort: (fn: (a: T, b: T) => number) => void
}

export function useList<T>(initial: T[] = []): ListResult<T> {
	const [items, setItems] = useState<T[]>(initial)

	const push = useCallback((item: T) => {
		setItems((prev) => [...prev, item])
	}, [])

	const removeAt = useCallback((index: number) => {
		setItems((prev) => prev.filter((_, i) => i !== index))
	}, [])

	const updateAt = useCallback((index: number, item: T) => {
		setItems((prev) => prev.map((v, i) => (i === index ? item : v)))
	}, [])

	const insertAt = useCallback((index: number, item: T) => {
		setItems((prev) => [...prev.slice(0, index), item, ...prev.slice(index)])
	}, [])

	const clear = useCallback(() => setItems([]), [])

	const filter = useCallback((fn: (item: T) => boolean) => {
		setItems((prev) => prev.filter(fn))
	}, [])

	const sort = useCallback((fn: (a: T, b: T) => number) => {
		setItems((prev) => [...prev].sort(fn))
	}, [])

	return { items, set: setItems, push, removeAt, updateAt, insertAt, clear, filter, sort }
}

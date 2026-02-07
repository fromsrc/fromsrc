"use client"

import { useCallback, useState } from "react"

export interface SelectionResult<T> {
	selected: Set<T>
	toggle: (item: T) => void
	select: (item: T) => void
	deselect: (item: T) => void
	clear: () => void
	selectAll: (items: T[]) => void
	isSelected: (item: T) => boolean
}

export function useSelection<T>(initial: T[] = []): SelectionResult<T> {
	const [selected, setSelected] = useState<Set<T>>(() => new Set(initial))

	const toggle = useCallback((item: T) => {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(item)) next.delete(item)
			else next.add(item)
			return next
		})
	}, [])

	const select = useCallback((item: T) => {
		setSelected((prev) => new Set(prev).add(item))
	}, [])

	const deselect = useCallback((item: T) => {
		setSelected((prev) => {
			const next = new Set(prev)
			next.delete(item)
			return next
		})
	}, [])

	const clear = useCallback(() => setSelected(new Set()), [])

	const selectAll = useCallback((items: T[]) => {
		setSelected(new Set(items))
	}, [])

	const isSelected = useCallback((item: T) => selected.has(item), [selected])

	return { selected, toggle, select, deselect, clear, selectAll, isSelected }
}

"use client"

import { useCallback, useRef, useState } from "react"

export interface UndoRedoResult<T> {
	state: T
	set: (value: T) => void
	undo: () => void
	redo: () => void
	canUndo: boolean
	canRedo: boolean
	reset: (value: T) => void
}

export function useUndoRedo<T>(initial: T): UndoRedoResult<T> {
	const [state, setState] = useState<T>(initial)
	const pastRef = useRef<T[]>([])
	const futureRef = useRef<T[]>([])

	const set = useCallback(
		(value: T) => {
			pastRef.current = [...pastRef.current, state]
			futureRef.current = []
			setState(value)
		},
		[state],
	)

	const undo = useCallback(() => {
		const past = pastRef.current
		if (past.length === 0) return
		const prev = past[past.length - 1]
		if (prev === undefined) return
		pastRef.current = past.slice(0, -1)
		futureRef.current = [state, ...futureRef.current]
		setState(prev)
	}, [state])

	const redo = useCallback(() => {
		const future = futureRef.current
		if (future.length === 0) return
		const next = future[0]
		if (next === undefined) return
		futureRef.current = future.slice(1)
		pastRef.current = [...pastRef.current, state]
		setState(next)
	}, [state])

	const reset = useCallback((value: T) => {
		pastRef.current = []
		futureRef.current = []
		setState(value)
	}, [])

	return {
		state,
		set,
		undo,
		redo,
		canUndo: pastRef.current.length > 0,
		canRedo: futureRef.current.length > 0,
		reset,
	}
}

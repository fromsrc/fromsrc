"use client"

import { useCallback, useState } from "react"

export interface StepperResult {
	step: number
	total: number
	first: boolean
	last: boolean
	next: () => void
	prev: () => void
	goTo: (step: number) => void
	reset: () => void
}

export function useStepper(total: number, initial = 0): StepperResult {
	const [step, setStep] = useState(initial)

	const next = useCallback(() => {
		setStep((s) => Math.min(s + 1, total - 1))
	}, [total])

	const prev = useCallback(() => {
		setStep((s) => Math.max(s - 1, 0))
	}, [])

	const goTo = useCallback(
		(s: number) => {
			setStep(Math.max(0, Math.min(s, total - 1)))
		},
		[total],
	)

	const reset = useCallback(() => setStep(initial), [initial])

	return {
		step,
		total,
		first: step === 0,
		last: step === total - 1,
		next,
		prev,
		goTo,
		reset,
	}
}

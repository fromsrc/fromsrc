"use client"

import { useCallback, useState } from "react"

type changeevent = { target: { value: unknown } }

function update<T extends Record<string, unknown>, K extends keyof T>(
	values: T,
	field: K,
	value: T[K],
): T {
	return { ...values, [field]: value }
}

export interface FormState<T extends Record<string, unknown>> {
	values: T
	errors: Partial<Record<keyof T, string>>
	touched: Partial<Record<keyof T, boolean>>
	dirty: boolean
	valid: boolean
	set: <K extends keyof T>(field: K, value: T[K]) => void
	setError: (field: keyof T, error: string | undefined) => void
	reset: () => void
	handleChange: <K extends keyof T>(field: K) => (e: changeevent) => void
	handleBlur: (field: keyof T) => () => void
}

export function useForm<T extends Record<string, unknown>>(
	initial: T,
	validate?: (values: T) => Partial<Record<keyof T, string>>,
): FormState<T> {
	const [values, setValues] = useState<T>(initial)
	const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
	const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

	const dirty = JSON.stringify(values) !== JSON.stringify(initial)
	const valid = Object.values(errors).every((e) => !e)

	const set = useCallback(
		<K extends keyof T>(field: K, value: T[K]) => {
			setValues((prev) => {
				const next = update(prev, field, value)
				if (validate) setErrors(validate(next))
				return next
			})
		},
		[validate],
	)

	const setError = useCallback((field: keyof T, error: string | undefined) => {
		setErrors((prev) => ({ ...prev, [field]: error }))
	}, [])

	const reset = useCallback(() => {
		setValues(initial)
		setErrors({})
		setTouched({})
	}, [initial])

	const handleChange = useCallback(
		<K extends keyof T>(field: K) =>
			(e: changeevent) =>
				set(field, e.target.value as T[K]),
		[set],
	)

	const handleBlur = useCallback(
		(field: keyof T) => () => setTouched((prev) => ({ ...prev, [field]: true })),
		[],
	)

	return { values, errors, touched, dirty, valid, set, setError, reset, handleChange, handleBlur }
}

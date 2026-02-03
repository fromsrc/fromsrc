"use client"

import { type ComponentPropsWithoutRef, type ReactNode, useEffect, useId, useRef } from "react"

export type CheckboxSize = "sm" | "md" | "lg"

/**
 * @param label - accessible label text
 * @param size - checkbox size
 * @param indeterminate - show indeterminate state
 * @param error - error message
 * @example <Checkbox label="Accept terms" />
 */
export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size"> {
	label?: ReactNode
	size?: CheckboxSize
	indeterminate?: boolean
	error?: ReactNode
}

const sizes: Record<CheckboxSize, { box: string; label: string }> = {
	sm: { box: "h-3.5 w-3.5", label: "text-xs" },
	md: { box: "h-4 w-4", label: "text-sm" },
	lg: { box: "h-5 w-5", label: "text-base" },
}

export function Checkbox({
	label,
	size = "md",
	indeterminate = false,
	error,
	className = "",
	id,
	disabled,
	...props
}: CheckboxProps) {
	const ref = useRef<HTMLInputElement>(null)
	const generatedId = useId()
	const checkboxId = id || generatedId
	const errorId = error ? `${checkboxId}-error` : undefined

	useEffect(() => {
		if (ref.current) {
			ref.current.indeterminate = indeterminate
		}
	}, [indeterminate])

	return (
		<div className="flex flex-col gap-1">
			<label
				htmlFor={checkboxId}
				className={`inline-flex items-center gap-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
			>
				<input
					ref={ref}
					type="checkbox"
					id={checkboxId}
					disabled={disabled}
					aria-invalid={error ? true : undefined}
					aria-describedby={errorId}
					className={`${sizes[size].box} cursor-pointer rounded border border-line bg-surface text-accent accent-accent focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1 focus:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
					{...props}
				/>
				{label && <span className={`${sizes[size].label} text-fg`}>{label}</span>}
			</label>
			{error && (
				<span id={errorId} className="text-xs text-red-400" role="alert">
					{error}
				</span>
			)}
		</div>
	)
}

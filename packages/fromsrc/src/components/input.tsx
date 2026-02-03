"use client"

import { type ReactNode, forwardRef, useId } from "react"
import { FormLabel } from "./formlabel"

export type InputVariant = "default" | "error"
export type InputSize = "sm" | "md" | "lg"

/**
 * Props for the Input component.
 * @property variant - visual style variant
 * @property size - input size
 * @property label - accessible label
 * @property error - error message
 * @property hint - helper text
 * @property tooltip - help text shown on hover
 */
export interface InputProps extends Omit<React.ComponentPropsWithRef<"input">, "size"> {
	variant?: InputVariant
	size?: InputSize
	label?: ReactNode
	error?: ReactNode
	hint?: ReactNode
	tooltip?: ReactNode
}

const variants: Record<InputVariant, string> = {
	default: "border-line bg-surface text-fg placeholder:text-muted focus:border-accent",
	error: "border-red-500/50 bg-red-500/5 text-fg placeholder:text-muted focus:border-red-500",
}

const sizes: Record<InputSize, string> = {
	sm: "h-8 px-2.5 text-xs",
	md: "h-10 px-3 text-sm",
	lg: "h-12 px-4 text-base",
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ variant = "default", size = "md", label, error, hint, tooltip, className = "", id, ...props },
	ref,
): React.ReactElement {
	const generatedId = useId()
	const inputId = id || generatedId
	const errorId = error ? `${inputId}-error` : undefined
	const hintId = hint && !error ? `${inputId}-hint` : undefined
	const describedBy = errorId || hintId

	const actualVariant = error ? "error" : variant

	return (
		<div className="flex flex-col gap-1.5">
			{label && <FormLabel label={label} tooltip={tooltip} htmlFor={inputId} />}
			<input
				ref={ref}
				id={inputId}
				aria-invalid={actualVariant === "error" ? true : undefined}
				aria-describedby={describedBy}
				className={`rounded-md border outline-none transition-colors ${variants[actualVariant]} ${sizes[size]} ${className}`.trim()}
				{...props}
			/>
			{error && (
				<span id={errorId} className="text-xs text-red-400" role="alert">
					{error}
				</span>
			)}
			{hint && !error && (
				<span id={hintId} className="text-xs text-muted">
					{hint}
				</span>
			)}
		</div>
	)
})

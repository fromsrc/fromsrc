"use client"

import { type ComponentPropsWithoutRef, type ReactNode, useId } from "react"
import { Tooltip } from "./tooltip"

export type InputVariant = "default" | "error"
export type InputSize = "sm" | "md" | "lg"

/**
 * @param variant - visual style variant
 * @param size - input size
 * @param label - accessible label
 * @param error - error message
 * @param hint - helper text
 * @param tooltip - help text shown on hover
 * @example <Input label="Email" placeholder="you@example.com" />
 */
export interface InputProps extends Omit<ComponentPropsWithoutRef<"input">, "size"> {
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

export function Input({
	variant = "default",
	size = "md",
	label,
	error,
	hint,
	tooltip,
	className = "",
	id,
	...props
}: InputProps) {
	const generatedId = useId()
	const inputId = id || generatedId
	const errorId = error ? `${inputId}-error` : undefined
	const hintId = hint && !error ? `${inputId}-hint` : undefined
	const describedBy = errorId || hintId

	const actualVariant = error ? "error" : variant

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label htmlFor={inputId} className="flex items-center gap-1.5 text-sm font-medium text-fg">
					{label}
					{tooltip && (
						<Tooltip content={tooltip}>
							<svg
								aria-hidden="true"
								className="h-3.5 w-3.5 text-muted"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<circle cx="12" cy="12" r="10" strokeWidth={2} />
								<path strokeLinecap="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
							</svg>
						</Tooltip>
					)}
				</label>
			)}
			<input
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
}

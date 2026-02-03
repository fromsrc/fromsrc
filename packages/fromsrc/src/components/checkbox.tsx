"use client"

import { type ComponentPropsWithoutRef, type ReactNode, useEffect, useId, useRef } from "react"
import { Tooltip } from "./tooltip"

export type CheckboxSize = "sm" | "md" | "lg"

/**
 * @param label - accessible label text
 * @param size - checkbox size
 * @param indeterminate - show indeterminate state
 * @param error - error message
 * @param tooltip - help text shown on hover
 * @example <Checkbox label="Accept terms" />
 */
export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size"> {
	label?: ReactNode
	size?: CheckboxSize
	indeterminate?: boolean
	error?: ReactNode
	tooltip?: ReactNode
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
	tooltip,
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
				{label && (
					<span className={`${sizes[size].label} text-fg flex items-center gap-1.5`}>
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
					</span>
				)}
			</label>
			{error && (
				<span id={errorId} className="text-xs text-red-400" role="alert">
					{error}
				</span>
			)}
		</div>
	)
}

"use client"

import {
	type ComponentPropsWithoutRef,
	type JSX,
	type ReactNode,
	memo,
	useEffect,
	useId,
	useRef,
} from "react"
import { ErrorMessage } from "./errormessage"
import { Tooltip } from "./tooltip"

/**
 * Available checkbox sizes
 */
export type CheckboxSize = "sm" | "md" | "lg"

/**
 * Props for the Checkbox component
 * @property label - Accessible label text displayed next to the checkbox
 * @property size - Visual size of the checkbox (sm, md, lg)
 * @property indeterminate - When true, displays the indeterminate state
 * @property error - Error message displayed below the checkbox
 * @property tooltip - Help text shown on hover via info icon
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

function CheckboxInner({
	label,
	size = "md",
	indeterminate = false,
	error,
	tooltip,
	className = "",
	id,
	disabled,
	"aria-label": ariaLabel,
	...props
}: CheckboxProps): JSX.Element {
	const ref = useRef<HTMLInputElement>(null)
	const generatedId = useId()
	const checkboxId = id || generatedId
	const errorId = error ? `${checkboxId}-error` : undefined

	useEffect((): void => {
		if (ref.current) {
			ref.current.indeterminate = indeterminate
		}
	}, [indeterminate])

	return (
		<div className="flex flex-col gap-1" role="group">
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
					aria-label={!label ? ariaLabel : undefined}
					aria-checked={indeterminate ? "mixed" : undefined}
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
			{error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
		</div>
	)
}

export const Checkbox = memo(CheckboxInner)

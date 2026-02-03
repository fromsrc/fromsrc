"use client"

import type React from "react"
import { type ComponentPropsWithoutRef, type ReactNode, memo, useId } from "react"
import { Tooltip } from "./tooltip"

/**
 * Available sizes for the switch component.
 */
export type SwitchSize = "sm" | "md" | "lg"

/**
 * Props for the Switch component.
 * @property checked - Whether the switch is on.
 * @property onChange - Callback when toggled.
 * @property size - Switch size (sm, md, lg).
 * @property label - Accessible label text.
 * @property disabled - Whether the switch is disabled.
 * @property tooltip - Help text shown on hover.
 */
export interface SwitchProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
	checked?: boolean
	onChange?: (checked: boolean) => void
	size?: SwitchSize
	label?: string
	tooltip?: ReactNode
}

const trackSizes: Record<SwitchSize, string> = {
	sm: "h-4 w-7",
	md: "h-5 w-9",
	lg: "h-6 w-11",
}

const thumbSizes: Record<SwitchSize, { size: string; translate: string }> = {
	sm: { size: "size-3", translate: "translate-x-3" },
	md: { size: "size-4", translate: "translate-x-4" },
	lg: { size: "size-5", translate: "translate-x-5" },
}

function SwitchComponent({
	checked = false,
	onChange,
	size = "md",
	label,
	tooltip,
	disabled = false,
	className = "",
	id,
	...props
}: SwitchProps): React.ReactElement {
	const generatedId = useId()
	const switchId = id || generatedId
	const labelId = `${switchId}-label`
	const descriptionId = tooltip ? `${switchId}-desc` : undefined

	const handleClick = (): void => {
		onChange?.(!checked)
	}

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
		if (event.key === " " || event.key === "Enter") {
			event.preventDefault()
			onChange?.(!checked)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<button
				id={switchId}
				type="button"
				role="switch"
				aria-checked={checked}
				aria-labelledby={label ? labelId : undefined}
				aria-describedby={descriptionId}
				aria-disabled={disabled}
				disabled={disabled}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				className={`
					relative inline-flex shrink-0 cursor-pointer items-center rounded-full
					border border-transparent transition-colors
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg
					disabled:cursor-not-allowed disabled:opacity-50
					${checked ? "bg-accent" : "bg-line"}
					${trackSizes[size]}
					${className}
				`.trim()}
				{...props}
			>
				<span
					aria-hidden="true"
					className={`
						pointer-events-none inline-block rounded-full bg-white shadow-sm
						ring-0 transition-transform
						${thumbSizes[size].size}
						${checked ? thumbSizes[size].translate : "translate-x-0.5"}
					`.trim()}
				/>
			</button>
			{label && (
				<label
					id={labelId}
					htmlFor={switchId}
					className={`flex items-center gap-1.5 text-sm text-fg select-none ${disabled ? "opacity-50" : "cursor-pointer"}`}
				>
					{label}
					{tooltip && (
						<Tooltip content={tooltip}>
							<span id={descriptionId} className="sr-only">
								{typeof tooltip === "string" ? tooltip : "Additional information"}
							</span>
							<svg
								aria-hidden="true"
								className="h-3.5 w-3.5 text-muted"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								role="img"
							>
								<circle cx="12" cy="12" r="10" strokeWidth={2} />
								<path strokeLinecap="round" strokeWidth={2} d="M12 16v-4m0-4h.01" />
							</svg>
						</Tooltip>
					)}
				</label>
			)}
		</div>
	)
}

export const Switch = memo(SwitchComponent)

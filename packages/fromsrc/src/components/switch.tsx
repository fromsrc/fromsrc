"use client"

import { type ComponentPropsWithoutRef, useId } from "react"

export type SwitchSize = "sm" | "md" | "lg"

/**
 * @param checked - whether the switch is on
 * @param onChange - callback when toggled
 * @param size - switch size
 * @param label - accessible label
 * @param disabled - whether the switch is disabled
 * @example <Switch label="Notifications" checked={on} onChange={setOn} />
 */
export interface SwitchProps extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
	checked?: boolean
	onChange?: (checked: boolean) => void
	size?: SwitchSize
	label?: string
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

export function Switch({
	checked = false,
	onChange,
	size = "md",
	label,
	disabled = false,
	className = "",
	id,
	...props
}: SwitchProps) {
	const generatedId = useId()
	const switchId = id || generatedId

	return (
		<div className="flex items-center gap-2">
			<button
				id={switchId}
				type="button"
				role="switch"
				aria-checked={checked}
				aria-labelledby={label ? `${switchId}-label` : undefined}
				disabled={disabled}
				onClick={() => onChange?.(!checked)}
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
					id={`${switchId}-label`}
					htmlFor={switchId}
					className={`text-sm text-fg select-none ${disabled ? "opacity-50" : "cursor-pointer"}`}
				>
					{label}
				</label>
			)}
		</div>
	)
}

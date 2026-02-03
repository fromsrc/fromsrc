"use client"

import {
	type JSX,
	type ReactNode,
	createContext,
	memo,
	useContext,
	useId,
	useState,
} from "react"

export type RadioSize = "sm" | "md" | "lg"

/**
 * Props for individual radio button within a RadioGroup.
 */
export interface RadioProps {
	/** Unique value identifying this radio option */
	value: string
	/** Accessible label displayed next to the radio */
	label?: ReactNode
	/** Disables this specific radio button */
	disabled?: boolean
	/** Additional CSS classes for the radio button */
	className?: string
}

/**
 * Props for the RadioGroup container that manages radio state.
 */
export interface RadioGroupProps {
	/** Currently selected value (controlled mode) */
	value?: string
	/** Initial value (uncontrolled mode) */
	defaultValue?: string
	/** Callback fired when selection changes */
	onChange?: (value: string) => void
	/** Form field name attribute */
	name?: string
	/** Size variant for all radios in group */
	size?: RadioSize
	/** Accessible label for the radio group */
	label?: string
	/** Layout direction of radio options */
	orientation?: "horizontal" | "vertical"
	/** Disables all radios in the group */
	disabled?: boolean
	/** Radio components to render */
	children: ReactNode
	/** Additional CSS classes for the group container */
	className?: string
}

/**
 * Internal context value for radio state management.
 */
interface RadioContextValue {
	name: string
	value?: string
	size: RadioSize
	disabled: boolean
	onChange: (value: string) => void
}

const RadioContext = createContext<RadioContextValue | null>(null)

const sizes: Record<RadioSize, { radio: string; label: string }> = {
	sm: { radio: "h-3.5 w-3.5", label: "text-xs" },
	md: { radio: "h-4 w-4", label: "text-sm" },
	lg: { radio: "h-5 w-5", label: "text-base" },
}

const dotSizes: Record<RadioSize, string> = {
	sm: "h-1.5 w-1.5",
	md: "h-2 w-2",
	lg: "h-2.5 w-2.5",
}

function RadioBase({
	value,
	label,
	disabled: localDisabled,
	className = "",
}: RadioProps): JSX.Element {
	const ctx = useContext(RadioContext)
	if (!ctx) throw new Error("Radio must be used within RadioGroup")

	const id = useId()
	const checked = ctx.value === value
	const disabled = localDisabled || ctx.disabled

	const handleClick = (): void => {
		if (!disabled) ctx.onChange(value)
	}

	const handleKeyDown = (e: React.KeyboardEvent): void => {
		if (e.key === " " || e.key === "Enter") {
			e.preventDefault()
			if (!disabled) ctx.onChange(value)
		}
	}

	return (
		<div className="flex items-center gap-2" data-radio-value={value}>
			<button
				type="button"
				role="radio"
				id={id}
				aria-checked={checked}
				aria-disabled={disabled}
				aria-labelledby={label ? `${id}-label` : undefined}
				disabled={disabled}
				tabIndex={checked ? 0 : -1}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				className={`
					relative inline-flex items-center justify-center rounded-full
					border border-line bg-surface
					focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg
					disabled:cursor-not-allowed disabled:opacity-50
					${checked ? "border-accent" : ""}
					${sizes[ctx.size].radio}
					${className}
				`.trim()}
			>
				{checked && (
					<span aria-hidden="true" className={`rounded-full bg-accent ${dotSizes[ctx.size]}`} />
				)}
			</button>
			{label && (
				<label
					id={`${id}-label`}
					htmlFor={id}
					className={`${sizes[ctx.size].label} text-fg select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
					onClick={handleClick}
				>
					{label}
				</label>
			)}
		</div>
	)
}

export const Radio = memo(RadioBase)

function RadioGroupBase({
	value: controlledValue,
	defaultValue,
	onChange,
	name,
	size = "md",
	label,
	orientation = "vertical",
	disabled = false,
	children,
	className = "",
}: RadioGroupProps): JSX.Element {
	const generatedName = useId()
	const groupId = useId()
	const groupName = name || generatedName
	const [internalValue, setInternalValue] = useState(defaultValue)

	const isControlled = controlledValue !== undefined
	const value = isControlled ? controlledValue : internalValue

	const handleChange = (newValue: string): void => {
		if (!isControlled) setInternalValue(newValue)
		onChange?.(newValue)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
		const radios = Array.from(
			e.currentTarget.querySelectorAll('[role="radio"]:not([disabled])'),
		) as HTMLElement[]
		const currentIndex = radios.findIndex((r) => r === document.activeElement)

		let nextIndex = -1
		if (e.key === "ArrowDown" || e.key === "ArrowRight") {
			e.preventDefault()
			nextIndex = currentIndex < radios.length - 1 ? currentIndex + 1 : 0
		} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
			e.preventDefault()
			nextIndex = currentIndex > 0 ? currentIndex - 1 : radios.length - 1
		}

		const nextRadio = radios[nextIndex]
		if (nextIndex !== -1 && nextRadio) {
			nextRadio.focus()
			const wrapper = nextRadio.closest("[data-radio-value]")
			const radioValue = wrapper?.getAttribute("data-radio-value")
			if (radioValue) handleChange(radioValue)
		}
	}

	return (
		<RadioContext.Provider
			value={{ name: groupName, value, size, disabled, onChange: handleChange }}
		>
			<div
				role="radiogroup"
				aria-label={label}
				aria-describedby={label ? `${groupId}-desc` : undefined}
				aria-orientation={orientation}
				onKeyDown={handleKeyDown}
				className={`flex ${orientation === "horizontal" ? "flex-row gap-4" : "flex-col gap-2"} ${className}`.trim()}
			>
				{children}
			</div>
		</RadioContext.Provider>
	)
}

export const RadioGroup = memo(RadioGroupBase)

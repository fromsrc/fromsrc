"use client"

import { createContext, type ReactNode, useContext, useId, useState } from "react"

export type RadioSize = "sm" | "md" | "lg"

/**
 * @param value - unique value for this radio option
 * @param label - accessible label text
 * @param disabled - whether the radio is disabled
 * @example <Radio value="a" label="Option A" />
 */
export interface RadioProps {
	value: string
	label?: ReactNode
	disabled?: boolean
	className?: string
}

/**
 * @param value - currently selected value
 * @param onChange - callback when selection changes
 * @param name - form field name
 * @param size - radio size
 * @param label - group label for accessibility
 * @param orientation - layout direction
 * @param disabled - disable all radios in group
 * @example <RadioGroup value={v} onChange={setV} label="Options"><Radio value="a" label="A" /></RadioGroup>
 */
export interface RadioGroupProps {
	value?: string
	defaultValue?: string
	onChange?: (value: string) => void
	name?: string
	size?: RadioSize
	label?: string
	orientation?: "horizontal" | "vertical"
	disabled?: boolean
	children: ReactNode
	className?: string
}

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

export function Radio({ value, label, disabled: localDisabled, className = "" }: RadioProps) {
	const ctx = useContext(RadioContext)
	if (!ctx) throw new Error("Radio must be used within RadioGroup")

	const id = useId()
	const checked = ctx.value === value
	const disabled = localDisabled || ctx.disabled

	const handleClick = () => {
		if (!disabled) ctx.onChange(value)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
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

export function RadioGroup({
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
}: RadioGroupProps) {
	const generatedName = useId()
	const groupName = name || generatedName
	const [internalValue, setInternalValue] = useState(defaultValue)

	const isControlled = controlledValue !== undefined
	const value = isControlled ? controlledValue : internalValue

	const handleChange = (newValue: string) => {
		if (!isControlled) setInternalValue(newValue)
		onChange?.(newValue)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
				onKeyDown={handleKeyDown}
				className={`flex ${orientation === "horizontal" ? "flex-row gap-4" : "flex-col gap-2"} ${className}`.trim()}
			>
				{children}
			</div>
		</RadioContext.Provider>
	)
}

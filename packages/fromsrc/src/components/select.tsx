"use client"

import type React from "react"
import { type ReactNode, useCallback, useId, useRef, useState } from "react"
import { getNextIndex } from "../hooks/arrownav"
import { useClickOutside } from "../hooks/clickoutside"
import { ErrorMessage } from "./errormessage"
import { FormLabel } from "./formlabel"
import { IconChevronDown } from "./icons"

/**
 * Option item for the Select component.
 * @property value - unique value for the option
 * @property label - display text for the option
 * @property disabled - whether the option is disabled
 */
export interface SelectOption {
	value: string
	label: string
	disabled?: boolean
}

/**
 * Props for the Select component.
 * @property options - list of selectable options
 * @property value - controlled value
 * @property defaultValue - uncontrolled default value
 * @property onChange - callback when selection changes
 * @property placeholder - text shown when no option selected
 * @property disabled - disable the select
 * @property error - error message
 * @property label - accessible label
 * @property tooltip - help text shown on hover
 */
export interface SelectProps {
	options: SelectOption[]
	value?: string
	defaultValue?: string
	onChange?: (value: string) => void
	placeholder?: string
	disabled?: boolean
	error?: ReactNode
	label?: ReactNode
	tooltip?: ReactNode
}

export function Select({
	options,
	value: controlledValue,
	defaultValue = "",
	onChange,
	placeholder = "select...",
	disabled = false,
	error,
	label,
	tooltip,
}: SelectProps): React.ReactElement {
	const [internalValue, setInternalValue] = useState(defaultValue)
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(-1)
	const containerRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const id = useId()

	const value = controlledValue ?? internalValue
	const selected = options.find((o) => o.value === value)

	const listId = `${id}-list`
	const labelId = label ? `${id}-label` : undefined
	const errorId = error ? `${id}-error` : undefined
	const getOptionId = (optValue: string) => `${id}-option-${optValue}`

	const close = useCallback(() => {
		setOpen(false)
		setIndex(-1)
	}, [])

	useClickOutside(containerRef, close, open)

	const isDisabled = useCallback((i: number) => options[i]?.disabled ?? false, [options])

	function handleSelect(option: SelectOption) {
		if (option.disabled) return
		if (controlledValue === undefined) {
			setInternalValue(option.value)
		}
		onChange?.(option.value)
		setOpen(false)
		setIndex(-1)
		triggerRef.current?.focus()
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (disabled) return

		if (!open) {
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
				setOpen(true)
				const currentIndex = options.findIndex((o) => o.value === value && !o.disabled)
				const firstEnabled = getNextIndex("Home", {
					count: options.length,
					current: -1,
					wrap: false,
					isDisabled,
				})
				setIndex(currentIndex >= 0 ? currentIndex : firstEnabled)
				e.preventDefault()
			}
			return
		}

		switch (e.key) {
			case "Escape":
				close()
				triggerRef.current?.focus()
				e.preventDefault()
				break
			case "Tab":
				close()
				break
			case "ArrowDown":
			case "ArrowUp":
			case "Home":
			case "End": {
				const next = getNextIndex(e.key, {
					count: options.length,
					current: index,
					wrap: false,
					isDisabled,
				})
				if (next !== index) setIndex(next)
				e.preventDefault()
				break
			}
			case "Enter":
			case " ":
				if (index >= 0 && options[index] && !options[index].disabled) {
					handleSelect(options[index])
				}
				e.preventDefault()
				break
		}
	}

	const activeOptionId =
		open && index >= 0 && options[index] ? getOptionId(options[index].value) : undefined

	return (
		<div className="flex flex-col gap-1.5">
			{label && <FormLabel label={label} tooltip={tooltip} id={labelId} />}
			<div ref={containerRef} className="relative">
				<button
					ref={triggerRef}
					type="button"
					role="combobox"
					aria-expanded={open}
					aria-controls={listId}
					aria-haspopup="listbox"
					aria-activedescendant={activeOptionId}
					aria-labelledby={labelId}
					aria-invalid={error ? true : undefined}
					aria-describedby={errorId}
					disabled={disabled}
					onClick={() => !disabled && setOpen(!open)}
					onKeyDown={handleKeyDown}
					className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm outline-none transition-colors ${
						error ? "border-red-500/50 bg-red-500/5" : "border-line bg-surface focus:border-accent"
					} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
				>
					<span className={selected ? "text-fg" : "text-muted"}>
						{selected?.label ?? placeholder}
					</span>
					<IconChevronDown
						size={16}
						className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
					/>
				</button>
				{open && (
					<div
						ref={listRef}
						id={listId}
						role="listbox"
						aria-labelledby={labelId}
						className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-bg p-1 shadow-lg"
					>
						{options.map((option, i) => (
							<div
								key={option.value}
								id={getOptionId(option.value)}
								role="option"
								aria-selected={option.value === value}
								aria-disabled={option.disabled}
								tabIndex={-1}
								onClick={() => handleSelect(option)}
								onMouseEnter={() => !option.disabled && setIndex(i)}
								className={`flex w-full cursor-pointer items-center rounded px-3 py-2 text-sm transition-colors ${
									option.disabled
										? "cursor-not-allowed text-muted/50"
										: i === index
											? "bg-surface text-fg"
											: option.value === value
												? "text-accent"
												: "text-muted hover:bg-surface hover:text-fg"
								}`}
							>
								{option.label}
							</div>
						))}
					</div>
				)}
			</div>
			{error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
		</div>
	)
}

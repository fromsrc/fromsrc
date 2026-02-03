"use client"

import { useCallback, useId, useRef, useState } from "react"
import { useClickOutside } from "../hooks/clickoutside"

export interface AutofillItem {
	id: string
	label: string
	value?: string
}

export interface AutofillProps {
	items: AutofillItem[]
	placeholder?: string
	value?: string
	onChange?: (value: string) => void
	onSelect?: (item: AutofillItem) => void
}

/**
 * Search-as-you-type input with dropdown suggestions.
 * Supports keyboard navigation (arrow keys, enter, escape).
 */
export function Autofill({
	items,
	placeholder = "search...",
	value: controlledValue,
	onChange,
	onSelect,
}: AutofillProps) {
	const [internalValue, setInternalValue] = useState("")
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const id = useId()

	const value = controlledValue ?? internalValue

	const filtered = items.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))

	const listId = `${id}-list`
	const getOptionId = (itemId: string) => `${id}-option-${itemId}`

	const close = useCallback(() => {
		setOpen(false)
		setIndex(0)
	}, [])

	useClickOutside(containerRef, close, open)

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const newValue = e.target.value
		if (controlledValue === undefined) {
			setInternalValue(newValue)
		}
		onChange?.(newValue)
		setOpen(true)
		setIndex(0)
	}

	function handleSelect(item: AutofillItem) {
		const selectedValue = item.value ?? item.label
		if (controlledValue === undefined) {
			setInternalValue(selectedValue)
		}
		onChange?.(selectedValue)
		onSelect?.(item)
		setOpen(false)
		inputRef.current?.focus()
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!open && filtered.length > 0 && e.key !== "Escape") {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				setOpen(true)
				e.preventDefault()
				return
			}
		}

		switch (e.key) {
			case "ArrowDown":
				setIndex((i) => Math.min(i + 1, filtered.length - 1))
				e.preventDefault()
				break
			case "ArrowUp":
				setIndex((i) => Math.max(i - 1, 0))
				e.preventDefault()
				break
			case "Enter":
				if (open && filtered[index]) {
					handleSelect(filtered[index])
					e.preventDefault()
				}
				break
			case "Escape":
				if (open) {
					setOpen(false)
					e.preventDefault()
				}
				break
			case "Tab":
				setOpen(false)
				break
		}
	}

	function handleFocus() {
		if (value && filtered.length > 0) {
			setOpen(true)
		}
	}

	const activeOptionId = open && filtered[index] ? getOptionId(filtered[index].id) : undefined

	return (
		<div ref={containerRef} className="relative w-full">
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onFocus={handleFocus}
				placeholder={placeholder}
				role="combobox"
				aria-expanded={open && filtered.length > 0}
				aria-controls={listId}
				aria-activedescendant={activeOptionId}
				aria-autocomplete="list"
				className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-muted"
			/>
			{open && filtered.length > 0 && (
				<div
					ref={listRef}
					id={listId}
					role="listbox"
					aria-label="suggestions"
					className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-bg p-1 shadow-lg"
				>
					{filtered.map((item, i) => (
						<button
							key={item.id}
							id={getOptionId(item.id)}
							type="button"
							role="option"
							aria-selected={i === index}
							tabIndex={-1}
							onClick={() => handleSelect(item)}
							onMouseEnter={() => setIndex(i)}
							className={`flex w-full items-center rounded px-3 py-2 text-left text-sm transition-colors ${
								i === index ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg"
							}`}
						>
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	)
}

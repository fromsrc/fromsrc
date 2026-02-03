"use client"

import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react"
import { IconSearch } from "./icons"

export interface CommandItem {
	id: string
	label: string
	icon?: ReactNode
	onSelect?: () => void
}

export interface CommandProps {
	items: CommandItem[]
	placeholder?: string
	onSelect?: (item: CommandItem) => void
}

export function Command({ items, placeholder = "search...", onSelect }: CommandProps) {
	const [query, setQuery] = useState("")
	const [index, setIndex] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLDivElement>(null)
	const id = useId()

	const filtered = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))

	const listId = `${id}-list`
	const getOptionId = (itemId: string) => `${id}-option-${itemId}`

	useEffect(() => {
		setIndex(0)
	}, [query])

	useEffect(() => {
		if (filtered.length > 0 && listRef.current) {
			const option = listRef.current.querySelector(`[data-index="${index}"]`)
			option?.scrollIntoView({ block: "nearest" })
		}
	}, [index, filtered.length])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			switch (e.key) {
				case "ArrowDown":
					setIndex((i) => Math.min(i + 1, filtered.length - 1))
					e.preventDefault()
					break
				case "ArrowUp":
					setIndex((i) => Math.max(i - 1, 0))
					e.preventDefault()
					break
				case "Home":
					setIndex(0)
					e.preventDefault()
					break
				case "End":
					setIndex(Math.max(0, filtered.length - 1))
					e.preventDefault()
					break
				case "Escape":
					if (query) {
						setQuery("")
					}
					e.preventDefault()
					break
				case "Enter":
					if (filtered[index]) {
						filtered[index].onSelect?.()
						onSelect?.(filtered[index])
					}
					e.preventDefault()
					break
			}
		},
		[filtered, index, query, onSelect],
	)

	const activeOptionId = filtered[index] ? getOptionId(filtered[index].id) : undefined

	return (
		<div className="w-full rounded-lg border border-line bg-bg">
			<div className="flex items-center gap-2 border-b border-line px-3">
				<IconSearch size={16} className="text-muted" />
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					role="combobox"
					aria-expanded={filtered.length > 0}
					aria-controls={listId}
					aria-activedescendant={activeOptionId}
					aria-autocomplete="list"
					className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
				/>
			</div>
			<div
				ref={listRef}
				id={listId}
				role="listbox"
				aria-label="results"
				className="max-h-64 overflow-y-auto p-1"
			>
				{filtered.length === 0 ? (
					<div role="status" className="px-3 py-6 text-center text-sm text-muted">
						no results
					</div>
				) : (
					filtered.map((item, i) => (
						<button
							key={item.id}
							id={getOptionId(item.id)}
							type="button"
							role="option"
							aria-selected={i === index}
							data-index={i}
							tabIndex={-1}
							onClick={() => {
								item.onSelect?.()
								onSelect?.(item)
								inputRef.current?.focus()
							}}
							onMouseEnter={() => setIndex(i)}
							className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-all duration-100 ${
								i === index ? "bg-surface text-fg" : "text-muted hover:bg-surface hover:text-fg"
							}`}
						>
							{item.icon && <span className="shrink-0">{item.icon}</span>}
							<span>{item.label}</span>
						</button>
					))
				)}
			</div>
		</div>
	)
}

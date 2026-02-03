"use client"

import { Search } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

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

	const filtered = items.filter((item) =>
		item.label.toLowerCase().includes(query.toLowerCase()),
	)

	useEffect(() => {
		setIndex(0)
	}, [query])

	function handleKeyDown(e: React.KeyboardEvent) {
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
				if (filtered[index]) {
					filtered[index].onSelect?.()
					onSelect?.(filtered[index])
				}
				e.preventDefault()
				break
		}
	}

	return (
		<div className="w-full rounded-lg border border-line bg-bg">
			<div className="flex items-center gap-2 border-b border-line px-3">
				<Search className="size-4 text-muted" aria-hidden />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
				/>
			</div>
			<div className="max-h-64 overflow-y-auto p-1">
				{filtered.length === 0 ? (
					<div className="px-3 py-6 text-center text-sm text-muted">no results</div>
				) : (
					filtered.map((item, i) => (
						<button
							key={item.id}
							type="button"
							onClick={() => {
								item.onSelect?.()
								onSelect?.(item)
							}}
							className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors ${
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

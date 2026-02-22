"use client"

import type { JSX } from "react"

export interface RecentProps {
	listId: string
	items: string[]
	selected: number
	onSelect: (query: string) => void
}

export function getRecentOptionId(index: number): string {
	return `search-recent-option-${index}`
}

export function Recent({ listId, items, selected, onSelect }: RecentProps): JSX.Element | null {
	if (items.length === 0) return null

	return (
		<div className="p-2">
			<div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-dim">recent</div>
			<ul id={listId} role="listbox">
				{items.map((item, index) => (
					<li key={item} id={getRecentOptionId(index)} role="option" aria-selected={index === selected}>
						<button
							type="button"
							onClick={() => onSelect(item)}
							className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-line ${index === selected ? "bg-bg border border-line text-fg" : "text-muted hover:bg-bg/50"}`}
						>
							{item}
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}

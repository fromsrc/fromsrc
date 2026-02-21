"use client"

import type { JSX } from "react"

export interface RecentProps {
	listId: string
	items: string[]
	onSelect: (query: string) => void
}

export function Recent({ listId, items, onSelect }: RecentProps): JSX.Element | null {
	if (items.length === 0) return null

	return (
		<div className="p-2">
			<div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-dim">recent</div>
			<ul id={listId} role="listbox">
				{items.map((item) => (
					<li key={item} role="option" aria-selected={false}>
						<button
							type="button"
							onClick={() => onSelect(item)}
							className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:bg-bg/50 transition-colors focus:outline-none focus:ring-1 focus:ring-line"
						>
							{item}
						</button>
					</li>
				))}
			</ul>
		</div>
	)
}

"use client"

import type { JSX } from "react"

export interface RecentProps {
	items: string[]
	onSelect: (query: string) => void
}

export function Recent({ items, onSelect }: RecentProps): JSX.Element | null {
	if (items.length === 0) return null

	return (
		<div className="p-2">
			<div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-dim">recent</div>
			<ul role="listbox">
				{items.map((item) => (
					<li
						key={item}
						role="option"
						aria-selected={false}
						onClick={() => onSelect(item)}
						onKeyDown={(e) => e.key === "Enter" && onSelect(item)}
						tabIndex={-1}
						className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:bg-bg/50 cursor-pointer transition-colors"
					>
						{item}
					</li>
				))}
			</ul>
		</div>
	)
}

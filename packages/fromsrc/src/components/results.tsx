"use client"

import type { JSX, ReactNode, RefObject } from "react"
import { useMemo } from "react"
import type { SearchResult } from "../search"

function highlightMatch(text: string, query: string): ReactNode {
	if (!query.trim()) return text
	const words = query.trim().split(/\s+/).filter(Boolean)
	const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")
	const pattern = new RegExp(`(${escaped})`, "gi")
	const parts = text.split(pattern)
	if (parts.length === 1) return text
	const matcher = new RegExp(`^(?:${escaped})$`, "i")
	return parts.map((part, i) =>
		matcher.test(part) ? (
			<mark key={i} className="bg-transparent text-fg font-medium">
				{part}
			</mark>
		) : (
			part
		),
	)
}

export function getOptionId(index: number): string {
	return `search-option-${index}`
}

function groupResults(results: SearchResult[]): Map<string, SearchResult[]> {
	const map = new Map<string, SearchResult[]>()
	for (const result of results) {
		const slug = result.doc.slug || ""
		const slashIndex = slug.indexOf("/")
		const category = slashIndex === -1 ? "docs" : slug.slice(0, slashIndex)
		const existing = map.get(category)
		if (existing) {
			existing.push(result)
		} else {
			map.set(category, [result])
		}
	}
	return map
}

interface ResultsProps {
	results: SearchResult[]
	selected: number
	query: string
	listRef: RefObject<HTMLUListElement | null>
	onResultClick: (slug: string | undefined, anchor?: string) => void
	onResultKeyDown: (e: React.KeyboardEvent, slug: string | undefined, anchor?: string) => void
}

export function Results({
	results,
	selected,
	query,
	listRef,
	onResultClick,
	onResultKeyDown,
}: ResultsProps): JSX.Element {
	const grouped = useMemo(() => groupResults(results), [results])

	let idx = 0

	return (
		<ul ref={listRef} id="search-listbox" role="listbox" className="p-2">
			{Array.from(grouped.entries()).map(([category, items]) => (
				<li key={category} role="presentation">
					<div className="px-3 pt-2 pb-1 text-[10px] font-medium text-dim uppercase tracking-wider">
						{category}
					</div>
					<ul role="group">
						{items.map((result) => {
							const i = idx++
							return (
								<li
									key={result.doc.slug || "index"}
									id={getOptionId(i)}
									role="option"
									aria-selected={i === selected}
									onClick={() => onResultClick(result.doc.slug, result.anchor)}
									onKeyDown={(e) => onResultKeyDown(e, result.doc.slug, result.anchor)}
									tabIndex={-1}
									className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
										i === selected
											? "bg-bg border border-line text-fg"
											: "text-muted hover:bg-bg/50"
									}`}
								>
									<div className="text-sm">{highlightMatch(result.doc.title, query)}</div>
									{result.anchor && <div className="text-[11px] text-dim">#{result.anchor}</div>}
									{result.snippet ? (
										<div className="text-xs text-dim truncate">
											{highlightMatch(result.snippet, query)}
										</div>
									) : (
										result.doc.description && (
											<div className="text-xs text-dim truncate">
												{highlightMatch(result.doc.description, query)}
											</div>
										)
									)}
								</li>
							)
						})}
					</ul>
				</li>
			))}
		</ul>
	)
}

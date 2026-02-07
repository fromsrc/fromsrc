"use client"

import type { JSX, RefObject } from "react"
import { useMemo } from "react"
import type { SearchResult } from "../search"

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
	listRef: RefObject<HTMLUListElement | null>
	onResultClick: (slug: string | undefined) => void
	onResultKeyDown: (e: React.KeyboardEvent, slug: string | undefined) => void
}

export function Results({
	results,
	selected,
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
									onClick={() => onResultClick(result.doc.slug)}
									onKeyDown={(e) => onResultKeyDown(e, result.doc.slug)}
									tabIndex={-1}
									className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
										i === selected
											? "bg-bg border border-line text-fg"
											: "text-muted hover:bg-bg/50"
									}`}
								>
									<div className="text-sm">{result.doc.title}</div>
									{result.snippet ? (
										<div className="text-xs text-dim truncate">{result.snippet}</div>
									) : (
										result.doc.description && (
											<div className="text-xs text-dim truncate">
												{result.doc.description}
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

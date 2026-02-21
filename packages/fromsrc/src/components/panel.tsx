"use client"

import type { JSX, KeyboardEvent as KeyEvent, RefObject } from "react"
import { useCallback, useRef } from "react"
import type { SearchResult } from "../search"
import { IconSearch } from "./icons"
import { Hints } from "./hints"
import { Recent } from "./recent"
import { Results, getOptionId } from "./results"

export interface PanelProps {
	query: string
	value: string
	safe: number
	recent: string[]
	loading: boolean
	results: SearchResult[]
	input: RefObject<HTMLInputElement | null>
	list: RefObject<HTMLUListElement | null>
	onClose: () => void
	onChange: (value: string) => void
	onKey: (event: KeyEvent<HTMLInputElement>) => void
	onSelect: (query: string) => void
	onNavigate: (slug: string | undefined, anchor?: string) => void
}

export function Panel({
	query,
	value,
	safe,
	recent,
	loading,
	results,
	input,
	list,
	onClose,
	onChange,
	onKey,
	onSelect,
	onNavigate,
}: PanelProps): JSX.Element {
	const dialog = useRef<HTMLDivElement>(null)
	const hasQuery = value.trim().length > 0
	const showRecent = !hasQuery && recent.length > 0
	const showResults = hasQuery && !loading && results.length > 0
	const listId = showRecent ? "search-recent-listbox" : "search-results-listbox"
	const resultStatus = loading
		? "loading results"
		: !hasQuery
			? recent.length > 0
				? `${recent.length} recent searches`
				: "no recent searches"
			: results.length === 0
				? "no results"
				: `${results.length} results`

	const onTab = useCallback((event: KeyEvent<HTMLDivElement>): void => {
		if (event.key !== "Tab" || !dialog.current) return
		const nodes = dialog.current.querySelectorAll<HTMLElement>(
			'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
		)
		const items = Array.from(nodes).filter((item) => !item.hasAttribute("aria-hidden"))
		if (items.length === 0) return
		const active = document.activeElement
		if (!(active instanceof HTMLElement) || !dialog.current.contains(active)) {
			event.preventDefault()
			items[0]?.focus()
			return
		}
		const index = items.findIndex((item) => item === active)
		if (index < 0) {
			event.preventDefault()
			items[0]?.focus()
			return
		}
		if (event.shiftKey) {
			if (index <= 0) {
				event.preventDefault()
				items[items.length - 1]?.focus()
			}
			return
		}
		if (index === items.length - 1) {
			event.preventDefault()
			items[0]?.focus()
		}
	}, [])

	return (
		<div className="fixed inset-0 z-[100]" onKeyDownCapture={onTab}>
			<button type="button" className="fixed inset-0 bg-bg/80 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="close search" />
			<div ref={dialog} className="relative z-10 max-w-lg mx-auto mt-[20vh]" role="dialog" aria-modal="true" aria-label="search documentation">
				<div className="bg-surface border border-line rounded-xl shadow-2xl overflow-hidden">
					<div className="flex items-center gap-3 px-4 border-b border-line">
						<IconSearch className="w-4 h-4 text-muted" size={16} />
						<input ref={input} type="text" value={query} onChange={(event) => onChange(event.target.value)} onKeyDown={onKey} placeholder="search documentation..." className="flex-1 py-4 bg-transparent text-fg text-sm placeholder:text-muted focus:outline-none" role="combobox" aria-expanded={showRecent || showResults} aria-haspopup="listbox" aria-controls={listId} aria-activedescendant={showResults && safe >= 0 ? getOptionId(safe) : undefined} aria-autocomplete="list" />
						<span className="sr-only" role="status" aria-live="polite">
							{resultStatus}
						</span>
						<kbd className="px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded">esc</kbd>
					</div>
					<div className="max-h-80 overflow-y-auto" aria-busy={loading}>
						{showRecent ? <Recent listId={listId} items={recent} onSelect={onSelect} /> : loading ? <div className="p-8 text-center text-muted text-sm" role="status" aria-live="polite">loading</div> : showResults ? <Results listId={listId} results={results} selected={safe} query={value} listRef={list} onResultClick={onNavigate} onResultKeyDown={(event, slug, anchor) => event.key === "Enter" && onNavigate(slug, anchor)} /> : <div className="p-8 text-center text-muted text-sm" role="status" aria-live="polite">no results</div>}
					</div>
					<Hints />
				</div>
			</div>
		</div>
	)
}

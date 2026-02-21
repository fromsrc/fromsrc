"use client"

import type { JSX, KeyboardEvent, RefObject } from "react"
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
	onKey: (event: KeyboardEvent) => void
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
	return (
		<div className="fixed inset-0 z-[100]">
			<button type="button" className="fixed inset-0 bg-bg/80 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="close search" />
			<div className="relative z-10 max-w-lg mx-auto mt-[20vh]" role="dialog" aria-modal="true" aria-label="search documentation">
				<div className="bg-surface border border-line rounded-xl shadow-2xl overflow-hidden">
					<div className="flex items-center gap-3 px-4 border-b border-line">
						<IconSearch className="w-4 h-4 text-muted" size={16} />
						<input ref={input} type="text" value={query} onChange={(event) => onChange(event.target.value)} onKeyDown={onKey} placeholder="search documentation..." className="flex-1 py-4 bg-transparent text-fg text-sm placeholder:text-muted focus:outline-none" role="combobox" aria-expanded={results.length > 0} aria-haspopup="listbox" aria-controls="search-listbox" aria-activedescendant={safe >= 0 ? getOptionId(safe) : undefined} aria-autocomplete="list" />
						<kbd className="px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded">esc</kbd>
					</div>
					<div className="max-h-80 overflow-y-auto">
						{!value.trim() && recent.length > 0 ? <Recent items={recent} onSelect={onSelect} /> : loading ? <div className="p-8 text-center text-muted text-sm">loading</div> : results.length === 0 ? <div className="p-8 text-center text-muted text-sm">no results</div> : <Results results={results} selected={safe} query={value} listRef={list} onResultClick={onNavigate} onResultKeyDown={(event, slug, anchor) => event.key === "Enter" && onNavigate(slug, anchor)} />}
					</div>
					<Hints />
				</div>
			</div>
		</div>
	)
}

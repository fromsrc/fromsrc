"use client"

import type { JSX } from "react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DocMeta, SearchDoc } from "../content"
import { useDebounce } from "../hooks/debounce"
import { useLocalStorage } from "../hooks/storage"
import type { SearchAdapter, SearchResult } from "../search"
import { localSearch } from "../search"
import { Recent } from "./recent"

export interface SearchProps {
	basePath?: string
	docs: (DocMeta | SearchDoc)[]
	hidden?: boolean
	adapter?: SearchAdapter
	debounce?: number
}

function toSearchDoc(doc: DocMeta | SearchDoc): SearchDoc {
	if ("content" in doc) return doc
	return { ...doc, content: "" }
}

function getOptionId(index: number): string {
	return `search-option-${index}`
}

export function Search({
	basePath = "/docs",
	docs,
	hidden,
	adapter = localSearch,
	debounce = 100,
}: SearchProps): JSX.Element | null {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [selected, setSelected] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLUListElement>(null)
	const router = useRouter()
	const prevQueryRef = useRef("")
	const [recent, setRecent] = useLocalStorage<string[]>("fromsrc-recent-searches", [])

	const searchDocs = useMemo(() => docs.map(toSearchDoc), [docs])
	const debouncedQuery = useDebounce(query, debounce)

	const handleGlobalKeyDown = useCallback((e: KeyboardEvent): void => {
		if ((e.metaKey || e.ctrlKey) && e.key === "k") {
			e.preventDefault()
			setOpen(true)
		}
		if (e.key === "Escape") {
			setOpen(false)
		}
	}, [])

	useEffect(() => {
		window.addEventListener("keydown", handleGlobalKeyDown)
		return () => window.removeEventListener("keydown", handleGlobalKeyDown)
	}, [handleGlobalKeyDown])

	useEffect(() => {
		if (open) {
			inputRef.current?.focus()
		} else {
			setQuery("")
			setSelected(0)
		}
	}, [open])

	const results = useMemo<SearchResult[]>(() => {
		return adapter.search(debouncedQuery, searchDocs)
	}, [adapter, searchDocs, debouncedQuery])

	const safeSelected = useMemo(() => {
		if (results.length === 0) return -1
		return Math.min(selected, results.length - 1)
	}, [selected, results.length])

	useEffect(() => {
		if (prevQueryRef.current !== debouncedQuery) {
			setSelected(0)
			prevQueryRef.current = debouncedQuery
		}
	}, [debouncedQuery])

	useEffect(() => {
		if (safeSelected >= 0 && listRef.current) {
			const option = listRef.current.querySelector(`#${getOptionId(safeSelected)}`)
			option?.scrollIntoView({ block: "nearest" })
		}
	}, [safeSelected])

	const saveRecent = useCallback(
		(q: string): void => {
			const trimmed = q.trim()
			if (!trimmed) return
			setRecent((prev) => [trimmed, ...prev.filter((p) => p !== trimmed)].slice(0, 5))
		},
		[setRecent],
	)

	const navigate = useCallback(
		(slug: string | undefined): void => {
			saveRecent(query)
			router.push(slug ? `${basePath}/${slug}` : basePath)
			setOpen(false)
		},
		[router, basePath, query, saveRecent],
	)

	const handleInputKeyDown = useCallback(
		(e: React.KeyboardEvent): void => {
			if (results.length === 0) return
			if (e.key === "ArrowDown") {
				e.preventDefault()
				setSelected((s) => Math.min(s + 1, results.length - 1))
			} else if (e.key === "ArrowUp") {
				e.preventDefault()
				setSelected((s) => Math.max(s - 1, 0))
			} else if (e.key === "Enter" && safeSelected >= 0 && results[safeSelected]) {
				navigate(results[safeSelected].doc.slug)
			}
		},
		[results, safeSelected, navigate],
	)

	const handleOpenClick = useCallback((): void => {
		setOpen(true)
	}, [])

	const handleCloseClick = useCallback((): void => {
		setOpen(false)
	}, [])

	const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
		setQuery(e.target.value)
	}, [])

	const handleResultClick = useCallback(
		(slug: string | undefined): void => {
			navigate(slug)
		},
		[navigate],
	)

	const handleResultKeyDown = useCallback(
		(e: React.KeyboardEvent, slug: string | undefined): void => {
			if (e.key === "Enter") {
				navigate(slug)
			}
		},
		[navigate],
	)

	const handleRecentSelect = useCallback((q: string): void => {
		setQuery(q)
	}, [])

	if (!open) {
		if (hidden) return null
		return (
			<button
				type="button"
				onClick={handleOpenClick}
				className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted bg-surface border border-line rounded-lg hover:border-dim transition-colors"
			>
				<svg
					className="w-3.5 h-3.5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<span className="flex-1 text-left">search</span>
				<kbd className="px-1.5 py-0.5 text-[10px] bg-bg border border-line rounded">⌘K</kbd>
			</button>
		)
	}

	return (
		<div className="fixed inset-0 z-[100]">
			<button
				type="button"
				className="fixed inset-0 bg-bg/80 backdrop-blur-sm cursor-default"
				onClick={handleCloseClick}
				aria-label="close search"
			/>
			<div className="relative z-10 max-w-lg mx-auto mt-[20vh]">
				<div className="bg-surface border border-line rounded-xl shadow-2xl overflow-hidden">
					<div className="flex items-center gap-3 px-4 border-b border-line">
						<svg
							className="w-4 h-4 text-muted"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={handleQueryChange}
							onKeyDown={handleInputKeyDown}
							placeholder="search documentation..."
							className="flex-1 py-4 bg-transparent text-fg text-sm placeholder:text-muted focus:outline-none"
							role="combobox"
							aria-expanded={results.length > 0}
							aria-haspopup="listbox"
							aria-controls="search-listbox"
							aria-activedescendant={safeSelected >= 0 ? getOptionId(safeSelected) : undefined}
							aria-autocomplete="list"
						/>
						<kbd className="px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded">
							esc
						</kbd>
					</div>
					<div className="max-h-80 overflow-y-auto">
						{!debouncedQuery.trim() && recent.length > 0 ? (
							<Recent items={recent} onSelect={handleRecentSelect} />
						) : results.length === 0 ? (
							<div className="p-8 text-center text-muted text-sm">no results</div>
						) : (
							<ul ref={listRef} id="search-listbox" role="listbox" className="p-2">
								{results.map((result, i) => (
									<li
										key={result.doc.slug || "index"}
										id={getOptionId(i)}
										role="option"
										aria-selected={i === safeSelected}
										onClick={() => handleResultClick(result.doc.slug)}
										onKeyDown={(e) => handleResultKeyDown(e, result.doc.slug)}
										tabIndex={-1}
										className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer ${
											i === safeSelected
												? "bg-bg border border-line text-fg"
												: "text-muted hover:bg-bg/50"
										}`}
									>
										<div className="text-sm">{result.doc.title}</div>
										{result.snippet ? (
											<div className="text-xs text-dim truncate">{result.snippet}</div>
										) : (
											result.doc.description && (
												<div className="text-xs text-dim truncate">{result.doc.description}</div>
											)
										)}
									</li>
								))}
							</ul>
						)}
					</div>
					<div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-line text-[10px] text-dim">
						<span className="flex items-center gap-1">
							<kbd className="px-1 py-0.5 bg-bg border border-line rounded">↑</kbd>
							<kbd className="px-1 py-0.5 bg-bg border border-line rounded">↓</kbd>
							navigate
						</span>
						<span className="flex items-center gap-1">
							<kbd className="px-1 py-0.5 bg-bg border border-line rounded">↵</kbd>
							select
						</span>
					</div>
				</div>
			</div>
		</div>
	)
}

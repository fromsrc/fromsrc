"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import type { DocMeta, SearchDoc } from "../content"
import type { SearchAdapter, SearchResult } from "../search"
import { localSearch } from "../search"

interface Props {
	basePath?: string
	docs: (DocMeta | SearchDoc)[]
	hidden?: boolean
	adapter?: SearchAdapter
}

function toSearchDocs(docs: (DocMeta | SearchDoc)[]): SearchDoc[] {
	return docs.map((doc) => ({
		...doc,
		content: "content" in doc ? doc.content : "",
	}))
}

export function Search({ basePath = "/docs", docs, hidden, adapter = localSearch }: Props) {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [selected, setSelected] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()

	const searchDocs = useMemo(() => toSearchDocs(docs), [docs])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault()
				setOpen(true)
			}
			if (e.key === "Escape") {
				setOpen(false)
			}
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [])

	useEffect(() => {
		if (open) {
			inputRef.current?.focus()
		} else {
			setQuery("")
			setSelected(0)
		}
	}, [open])

	const results = useMemo<SearchResult[]>(() => {
		return adapter.search(query, searchDocs)
	}, [adapter, searchDocs, query])

	useEffect(() => {
		setSelected(0)
	}, [results])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault()
			setSelected((s) => Math.min(s + 1, results.length - 1))
		}
		if (e.key === "ArrowUp") {
			e.preventDefault()
			setSelected((s) => Math.max(s - 1, 0))
		}
		if (e.key === "Enter" && results[selected]) {
			const r = results[selected]
			router.push(r.doc.slug ? `${basePath}/${r.doc.slug}` : basePath)
			setOpen(false)
		}
	}

	if (!open) {
		if (hidden) return null
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
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
				onClick={() => setOpen(false)}
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
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="search documentation..."
							className="flex-1 py-4 bg-transparent text-fg text-sm placeholder:text-muted focus:outline-none"
							role="combobox"
							aria-expanded={results.length > 0}
							aria-controls="search-results"
							aria-activedescendant={results[selected] ? `result-${selected}` : undefined}
							aria-autocomplete="list"
						/>
						<kbd className="px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded">
							esc
						</kbd>
					</div>
					<div className="max-h-80 overflow-y-auto" id="search-results" role="listbox">
						{results.length === 0 ? (
							<div className="p-8 text-center text-muted text-sm">no results</div>
						) : (
							<ul className="p-2">
								{results.map((result, i) => (
									<li key={result.doc.slug || "index"}>
										<button
											id={`result-${i}`}
											type="button"
											role="option"
											aria-selected={i === selected}
											onClick={() => {
												router.push(
													result.doc.slug ? `${basePath}/${result.doc.slug}` : basePath
												)
												setOpen(false)
											}}
											className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
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
										</button>
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

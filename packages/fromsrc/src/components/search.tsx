"use client"
import type { JSX } from "react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DocMeta, SearchDoc } from "../content"
import { useDebounce } from "../hooks/debounce"
import { useLocalStorage } from "../hooks/storage"
import type { SearchAdapter } from "../search"
import { localSearch } from "../search"
import { IconSearch } from "./icons"
import { Recent } from "./recent"
import { Results, getOptionId } from "./results"
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
	const [recent, setRecent] = useLocalStorage<string[]>("fromsrc-recent-searches", [])
	const inputRef = useRef<HTMLInputElement>(null)
	const listRef = useRef<HTMLUListElement>(null)
	const router = useRouter()
	const searchDocs = useMemo(() => docs.map(toSearchDoc), [docs])
	const debouncedQuery = useDebounce(query, debounce)
	const results = useMemo(() => adapter.search(debouncedQuery, searchDocs), [adapter, searchDocs, debouncedQuery])
	const safe = results.length === 0 ? -1 : Math.min(selected, results.length - 1)

	useEffect(() => {
		const handler = (e: KeyboardEvent): void => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault()
				setOpen(true)
			}
			if (e.key === "Escape") setOpen(false)
		}
		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [])

	useEffect(() => {
		if (open) {
			inputRef.current?.focus()
			document.body.style.overflow = "hidden"
			return
		}
		setQuery("")
		setSelected(0)
		document.body.style.overflow = ""
		return () => {
			document.body.style.overflow = ""
		}
	}, [open])

	useEffect(() => setSelected(0), [debouncedQuery])

	useEffect(() => {
		if (safe < 0 || !listRef.current) return
		const option = listRef.current.querySelector(`#${getOptionId(safe)}`)
		option?.scrollIntoView({ block: "nearest" })
	}, [safe])

	const save = useCallback(
		(value: string): void => {
			const trimmed = value.trim()
			if (!trimmed) return
			setRecent((items) => [trimmed, ...items.filter((item) => item !== trimmed)].slice(0, 5))
		},
		[setRecent],
	)

	const navigate = useCallback(
		(slug: string | undefined, anchor?: string): void => {
			save(query)
			const target = slug ? `${basePath}/${slug}` : basePath
			router.push(anchor ? `${target}#${anchor}` : target)
			setOpen(false)
		},
		[basePath, query, router, save],
	)

	const onkey = useCallback(
		(e: React.KeyboardEvent): void => {
			if (results.length === 0) return
			if (e.key === "ArrowDown") {
				e.preventDefault()
				setSelected((value) => Math.min(value + 1, results.length - 1))
				return
			}
			if (e.key === "ArrowUp") {
				e.preventDefault()
				setSelected((value) => Math.max(value - 1, 0))
				return
			}
			if (e.key === "Home") {
				e.preventDefault()
				setSelected(0)
				return
			}
			if (e.key === "End") {
				e.preventDefault()
				setSelected(results.length - 1)
				return
			}
			if (e.key === "Tab" && results[0]) {
				e.preventDefault()
				setQuery(results[0].doc.title)
				setSelected(0)
				return
			}
			if (e.key === "Enter" && safe >= 0 && results[safe]) {
				navigate(results[safe].doc.slug, results[safe].anchor)
			}
		},
		[navigate, results, safe],
	)
	if (!open) {
		if (hidden) return null
		return (
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted bg-surface border border-line rounded-lg hover:border-dim transition-colors"
			>
				<IconSearch className="w-3.5 h-3.5" size={14} />
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
						<IconSearch className="w-4 h-4 text-muted" size={16} />
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={onkey}
							placeholder="search documentation..."
							className="flex-1 py-4 bg-transparent text-fg text-sm placeholder:text-muted focus:outline-none"
							role="combobox"
							aria-expanded={results.length > 0}
							aria-haspopup="listbox"
							aria-controls="search-listbox"
							aria-activedescendant={safe >= 0 ? getOptionId(safe) : undefined}
							aria-autocomplete="list"
						/>
						<kbd className="px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded">esc</kbd>
					</div>
					<div className="max-h-80 overflow-y-auto">
						{!debouncedQuery.trim() && recent.length > 0 ? (
							<Recent items={recent} onSelect={setQuery} />
						) : results.length === 0 ? (
							<div className="p-8 text-center text-muted text-sm">no results</div>
						) : (
							<Results
								results={results}
								selected={safe}
								query={debouncedQuery}
								listRef={listRef}
								onResultClick={navigate}
								onResultKeyDown={(e, slug, anchor) => e.key === "Enter" && navigate(slug, anchor)}
							/>
						)}
					</div>
					<div className="flex items-center justify-center gap-4 px-4 py-2 border-t border-line text-[10px] text-dim">
						<span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg border border-line rounded">↑</kbd><kbd className="px-1 py-0.5 bg-bg border border-line rounded">↓</kbd>navigate</span>
						<span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg border border-line rounded">tab</kbd><kbd className="px-1 py-0.5 bg-bg border border-line rounded">↵</kbd>complete/select</span>
						<span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-bg border border-line rounded">home</kbd><kbd className="px-1 py-0.5 bg-bg border border-line rounded">end</kbd>first/last</span>
					</div>
				</div>
			</div>
		</div>
	)
}

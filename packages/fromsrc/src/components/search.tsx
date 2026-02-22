"use client"
import type { JSX } from "react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DocMeta, SearchDoc } from "../content"
import { useDebounce } from "../hooks/debounce"
import { useLocalStorage } from "../hooks/storage"
import { useScrollLock } from "../hooks/scrolllock"
import type { SearchResult } from "../search"
import type { SearchAdapter } from "../search"
import { localSearch } from "../search"
import { trimquery } from "../searchpolicy"
import { getOptionId } from "./results"
import { Panel } from "./panel"
import { Trigger } from "./trigger"
import { useSearcher } from "./searcher"

export interface SearchProps {
	basePath?: string
	docs?: (DocMeta | SearchDoc)[]
	endpoint?: string
	hidden?: boolean
	adapter?: SearchAdapter
	debounce?: number
	limit?: number
}

function tosearchdoc(doc: DocMeta | SearchDoc): SearchDoc {
	if ("content" in doc) return doc
	return { ...doc, content: "" }
}

function iseditable(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false
	const tag = target.tagName
	return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable
}

export function Search({
	basePath = "/docs",
	docs = [],
	endpoint,
	hidden,
	adapter = localSearch,
	debounce = 100,
	limit = 8,
}: SearchProps): JSX.Element | null {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [selected, setSelected] = useState(0)
	const [recent, setRecent] = useLocalStorage<string[]>("fromsrc-recent-searches", [])
	const [local, setLocal] = useState<SearchResult[]>([])
	const [adapterloading, setAdapterLoading] = useState(false)
	const input = useRef<HTMLInputElement>(null)
	const list = useRef<HTMLUListElement>(null)
	const queryref = useRef("")
	const requestref = useRef(0)
	const lastfocus = useRef<HTMLElement | null>(null)
	const updatequery = useCallback((next: string): void => {
		const value = trimquery(next)
		queryref.current = value
		setQuery(value)
	}, [])
	const router = useRouter()
	const searchdocs = useMemo(() => docs.map(tosearchdoc), [docs])
	const value = useDebounce(query, debounce)
	const remote = useSearcher(endpoint, value, limit)
	const remoteResults = useMemo(() => {
		if (!endpoint) return []
		if (value.trim() !== queryref.current.trim()) return []
		return remote.results
	}, [endpoint, remote.results, value])
	const results = endpoint ? remoteResults : local
	const loading = endpoint ? remote.loading : adapterloading
	const safe = results.length === 0 ? -1 : Math.min(selected, results.length - 1)
	useScrollLock(open)
	const openmodal = useCallback((): void => {
		const active = document.activeElement
		lastfocus.current = active instanceof HTMLElement ? active : null
		setOpen(true)
	}, [])

	useEffect(() => {
		const handler = (event: KeyboardEvent): void => {
			if ((event.metaKey || event.ctrlKey) && event.key === "k") {
				event.preventDefault()
				openmodal()
			}
			const slash = event.key === "/" || event.code === "Slash"
			if (slash && !event.metaKey && !event.ctrlKey && !event.altKey && !iseditable(event.target)) {
				event.preventDefault()
				openmodal()
			}
			if (event.key === "Escape") setOpen(false)
		}
		window.addEventListener("keydown", handler)
		return () => window.removeEventListener("keydown", handler)
	}, [openmodal])

	useEffect(() => {
		if (open) {
			input.current?.focus()
		} else {
			updatequery("")
			setSelected(0)
			lastfocus.current?.focus()
		}
	}, [open, updatequery])

	useEffect(() => setSelected(0), [value])

	useEffect(() => {
		if (endpoint) return
		const id = requestref.current + 1
		requestref.current = id
		const result = adapter.search(value, searchdocs, limit)
		if (result instanceof Promise) {
			setAdapterLoading(true)
			void result.then((next) => {
				if (requestref.current !== id) return
				setLocal(next)
				setAdapterLoading(false)
			}).catch(() => {
				if (requestref.current !== id) return
				setLocal([])
				setAdapterLoading(false)
			})
			return
		}
		setLocal(result)
		setAdapterLoading(false)
	}, [adapter, endpoint, limit, searchdocs, value])

	useEffect(() => {
		if (safe < 0 || !list.current) return
		const option = list.current.querySelector(`#${getOptionId(safe)}`)
		option?.scrollIntoView({ block: "nearest" })
	}, [safe])

	const save = useCallback(
		(item: string): void => {
			const text = item.trim()
			if (!text) return
			setRecent((items) => [text, ...items.filter((entry) => entry !== text)].slice(0, 5))
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
		(event: React.KeyboardEvent): void => {
			if (results.length === 0) return
			if (event.key === "ArrowDown") {
				event.preventDefault()
				setSelected((item) => Math.min(item + 1, results.length - 1))
				return
			}
			if (event.key === "ArrowUp") {
				event.preventDefault()
				setSelected((item) => Math.max(item - 1, 0))
				return
			}
			if (event.key === "Home") {
				event.preventDefault()
				setSelected(0)
				return
			}
			if (event.key === "End") {
				event.preventDefault()
				setSelected(results.length - 1)
				return
			}
			if (event.key === "Tab" && results[0]) {
				event.preventDefault()
				updatequery(results[0].doc.title)
				setSelected(0)
				return
			}
			if (event.key === "Enter" && safe >= 0 && results[safe]) {
				navigate(results[safe].doc.slug, results[safe].anchor)
			}
		},
		[navigate, results, safe, updatequery],
	)

	if (!open) {
		if (hidden) return null
		return <Trigger onOpen={openmodal} />
	}

	return (
		<Panel
			query={query}
			value={value}
			safe={safe}
			recent={recent}
			loading={loading}
			results={results}
			input={input}
			list={list}
			onClose={() => setOpen(false)}
			onChange={updatequery}
			onKey={onkey}
			onSelect={updatequery}
			onNavigate={navigate}
		/>
	)
}

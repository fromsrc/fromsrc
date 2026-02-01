"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import type { DocMeta } from "../content"

interface Props {
	basePath?: string
	docs: DocMeta[]
}

function fuzzy(text: string, query: string): number {
	if (!query) return 0
	const lower = text.toLowerCase()
	const q = query.toLowerCase()
	let score = 0
	let qi = 0
	let consecutive = 0

	for (let i = 0; i < lower.length && qi < q.length; i++) {
		if (lower[i] === q[qi]) {
			score += 1 + consecutive
			consecutive++
			qi++
		} else {
			consecutive = 0
		}
	}

	if (qi < q.length) return 0
	if (lower.startsWith(q)) score += 10
	if (lower === q) score += 20

	return score
}

function rank(doc: DocMeta, query: string): number {
	const titleScore = fuzzy(doc.title, query) * 3
	const descScore = doc.description ? fuzzy(doc.description, query) : 0
	return titleScore + descScore
}

export function Search({ basePath = "/docs", docs }: Props) {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [selected, setSelected] = useState(0)
	const inputRef = useRef<HTMLInputElement>(null)
	const router = useRouter()

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

	const filtered = useMemo(() => {
		if (!query.trim()) return docs.slice(0, 8)

		return docs
			.map((doc) => ({ doc, score: rank(doc, query) }))
			.filter((r) => r.score > 0)
			.sort((a, b) => b.score - a.score)
			.slice(0, 8)
			.map((r) => r.doc)
	}, [docs, query])

	useEffect(() => {
		setSelected(0)
	}, [query])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault()
			setSelected((s) => Math.min(s + 1, filtered.length - 1))
		}
		if (e.key === "ArrowUp") {
			e.preventDefault()
			setSelected((s) => Math.max(s - 1, 0))
		}
		if (e.key === "Enter" && filtered[selected]) {
			router.push(filtered[selected].slug ? `${basePath}/${filtered[selected].slug}` : basePath)
			setOpen(false)
		}
	}

	if (!open) {
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
		<div className="fixed inset-0 z-50">
			<div
				className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
				onClick={() => setOpen(false)}
				onKeyDown={() => {}}
			/>
			<div className="relative max-w-lg mx-auto mt-[20vh]">
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
						/>
						<kbd className="px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded">
							esc
						</kbd>
					</div>
					<div className="max-h-80 overflow-y-auto">
						{filtered.length === 0 ? (
							<div className="p-8 text-center text-muted text-sm">no results</div>
						) : (
							<ul className="p-2">
								{filtered.map((result, i) => (
									<li key={result.slug || "index"}>
										<button
											type="button"
											onClick={() => {
												router.push(result.slug ? `${basePath}/${result.slug}` : basePath)
												setOpen(false)
											}}
											className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
												i === selected
													? "bg-bg border border-line text-fg"
													: "text-muted hover:bg-bg/50"
											}`}
										>
											<div className="text-sm">{result.title}</div>
											{result.description && (
												<div className="text-xs text-dim truncate">{result.description}</div>
											)}
										</button>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import type { DocMeta } from "../content"

interface Props {
	basePath?: string
	docs: DocMeta[]
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

	const filtered = docs.filter(
		(r) =>
			r.title.toLowerCase().includes(query.toLowerCase()) ||
			r.description?.toLowerCase().includes(query.toLowerCase())
	)

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
						<kbd className="px-1.5 py-0.5 text-[10px] text-muted bg-bg border border-line rounded">esc</kbd>
					</div>
					<div className="max-h-80 overflow-y-auto">
						{filtered.length === 0 ? (
							<div className="p-8 text-center text-muted text-sm">no results</div>
						) : (
							<ul className="p-2">
								{filtered.map((result, i) => (
									<li key={result.slug}>
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
												<div className="text-xs text-dim truncate">
													{result.description}
												</div>
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

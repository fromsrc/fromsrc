"use client"

import { type JSX, memo, useCallback, useEffect, useRef, useState } from "react"
import { useScrollLock } from "../hooks/scrolllock"

export interface SearchDialogProps {
	open: boolean
	onClose: () => void
	onSearch: (query: string) => void
	results?: { title: string; description?: string; href: string; section?: string }[]
	placeholder?: string
	className?: string
	loading?: boolean
}

export const SearchDialog = memo(function SearchDialog({
	open, onClose, onSearch, results, placeholder = "Search docs...", className, loading,
}: SearchDialogProps): JSX.Element | null {
	const [query, setQuery] = useState("")
	const [active, setActive] = useState(-1)
	const inputRef = useRef<HTMLInputElement>(null)
	useScrollLock(open)

	useEffect(() => {
		if (!open) {
			setQuery("")
			setActive(-1)
			return
		}
		const handler = (e: KeyboardEvent): void => {
			if (e.key === "Escape") onClose()
		}
		window.addEventListener("keydown", handler)
		requestAnimationFrame(() => inputRef.current?.focus())
		return () => {
			window.removeEventListener("keydown", handler)
		}
	}, [open, onClose])

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setQuery(e.target.value)
			setActive(-1)
			onSearch(e.target.value)
		},
		[onSearch],
	)

	const handleInputKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!results || results.length === 0) return
		if (e.key === "ArrowDown") {
			e.preventDefault()
			setActive((prev) => Math.min(results.length - 1, prev + 1))
			return
		}
		if (e.key === "ArrowUp") {
			e.preventDefault()
			setActive((prev) => Math.max(-1, prev - 1))
			return
		}
		if (e.key === "Enter" && active >= 0) {
			e.preventDefault()
			const item = results[active]
			if (!item) return
			window.location.href = item.href
		}
	}, [active, results])

	const handleBackdrop = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === e.currentTarget) onClose()
		},
		[onClose],
	)

	if (!open) return null

	return (
		<div
			className={`fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[20vh] ${className ?? ""}`}
			onClick={handleBackdrop}
			role="presentation"
		>
			<div className="w-full max-w-lg rounded-xl border border-line bg-bg shadow-2xl overflow-hidden">
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={handleChange}
					onKeyDown={handleInputKey}
					placeholder={placeholder}
					className="w-full px-4 py-3 bg-transparent text-fg text-sm placeholder:text-muted border-b border-line focus:outline-none"
				/>
				<div className="max-h-72 overflow-y-auto">
					{loading ? (
						<div className="p-4 text-center text-muted text-sm">loading...</div>
					) : results && results.length === 0 && query.trim() ? (
						<div className="p-4 text-center text-muted text-sm">no results</div>
					) : (
						results?.map((r, i) => (
							<a
								key={r.href}
								href={r.href}
								onMouseEnter={() => setActive(i)}
								className={`flex flex-col gap-0.5 px-4 py-2.5 transition-colors ${i === active ? "bg-surface" : "hover:bg-surface"}`}
							>
								<div className="flex items-center gap-2">
									<span className="text-sm text-fg">{r.title}</span>
									{r.section && <span className="text-xs text-muted">{r.section}</span>}
								</div>
								{r.description && <span className="text-xs text-muted">{r.description}</span>}
							</a>
						))
					)}
				</div>
			</div>
		</div>
	)
})

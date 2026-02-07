"use client"

import { type ChangeEvent, type ReactNode, useCallback, useRef } from "react"
import type { SidebarFolder, SidebarSection } from "./sidebar"

const matches = (text: string, q: string) => text.toLowerCase().includes(q.toLowerCase())
const foldermatches = (f: SidebarFolder, q: string): boolean =>
	matches(f.title, q) ||
	f.items.some((i) => (i.type === "folder" ? foldermatches(i, q) : matches(i.title, q)))

export function filternavigation(nav: SidebarSection[], q: string): SidebarSection[] {
	if (!q) return nav
	return nav
		.map((s) => ({
			...s,
			items: s.items.filter((i) => {
				if (!("type" in i)) return matches(i.title, q)
				return i.type === "folder" ? foldermatches(i, q) : matches(i.title, q)
			}),
		}))
		.filter((s) => s.items.length > 0)
}

export function SidebarFilter({ value, onChange }: { value: string; onChange: (v: string) => void }): ReactNode {
	const ref = useRef<HTMLInputElement>(null)
	const handle = useCallback((e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value), [onChange])
	const clear = useCallback(() => {
		onChange("")
		ref.current?.focus()
	}, [onChange])

	return (
		<div className="relative">
			<input
				ref={ref}
				type="text"
				value={value}
				onChange={handle}
				aria-label="filter navigation"
				placeholder="filter..."
				className="w-full h-8 px-2.5 pr-7 rounded-md border border-line bg-surface/50 text-sm text-fg placeholder:text-muted outline-none transition-colors focus:border-accent"
			/>
			{value && (
				<button
					type="button"
					onClick={clear}
					aria-label="clear filter"
					className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-muted hover:text-fg transition-colors"
				>
					<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			)}
		</div>
	)
}

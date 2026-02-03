"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useRef, useState } from "react"

export interface NavTab {
	id: string
	label: string
	href: string
	icon?: ReactNode
	match?: string[]
}

interface TabNavProps {
	tabs: NavTab[]
}

export function TabNav({ tabs }: TabNavProps) {
	const pathname = usePathname()

	const isActive = (tab: NavTab) => {
		if (tab.match) {
			return tab.match.some((pattern) => pathname.startsWith(pattern))
		}
		return pathname.startsWith(tab.href)
	}

	return (
		<div className="flex gap-1 p-1 bg-surface rounded-lg" role="tablist">
			{tabs.map((tab) => {
				const active = isActive(tab)
				return (
					<Link
						key={tab.id}
						href={tab.href}
						role="tab"
						aria-selected={active}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							active ? "bg-bg text-fg shadow-sm" : "text-muted hover:text-fg hover:bg-bg/50"
						}`}
					>
						{tab.icon && (
							<span className="w-4 h-4" aria-hidden="true">
								{tab.icon}
							</span>
						)}
						{tab.label}
					</Link>
				)
			})}
		</div>
	)
}

interface TabNavDropdownProps {
	tabs: NavTab[]
}

export function TabNavDropdown({ tabs }: TabNavDropdownProps) {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const [focused, setFocused] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)

	const isActive = (tab: NavTab) => {
		if (tab.match) {
			return tab.match.some((pattern) => pathname.startsWith(pattern))
		}
		return pathname.startsWith(tab.href)
	}

	const currentTab = tabs.find((tab) => isActive(tab)) || tabs[0]
	const currentIndex = tabs.findIndex((tab) => isActive(tab))

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!open) {
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
				e.preventDefault()
				setOpen(true)
				setFocused(currentIndex >= 0 ? currentIndex : 0)
			}
			return
		}

		if (e.key === "Escape") {
			e.preventDefault()
			setOpen(false)
		} else if (e.key === "ArrowDown") {
			e.preventDefault()
			setFocused((f) => Math.min(f + 1, tabs.length - 1))
		} else if (e.key === "ArrowUp") {
			e.preventDefault()
			setFocused((f) => Math.max(f - 1, 0))
		} else if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			setOpen(false)
		}
	}

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				onKeyDown={handleKeyDown}
				onBlur={(e) => {
					if (!containerRef.current?.contains(e.relatedTarget)) {
						setOpen(false)
					}
				}}
				aria-expanded={open}
				aria-haspopup="listbox"
				className="flex items-center gap-2 px-3 py-2 w-full rounded-lg bg-surface border border-line text-sm font-medium text-fg hover:bg-surface/80 transition-colors"
			>
				{currentTab?.icon && (
					<span className="w-4 h-4" aria-hidden="true">
						{currentTab.icon}
					</span>
				)}
				{currentTab?.label}
				<svg
					className={`w-4 h-4 ml-auto text-muted transition-transform ${open ? "rotate-180" : ""}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{open && (
				<div
					className="absolute left-0 right-0 top-full mt-1 bg-surface border border-line rounded-lg shadow-lg overflow-hidden z-50"
					role="listbox"
				>
					{tabs.map((tab, i) => {
						const active = isActive(tab)
						return (
							<Link
								key={tab.id}
								href={tab.href}
								role="option"
								aria-selected={active}
								onClick={() => setOpen(false)}
								onKeyDown={handleKeyDown}
								onFocus={() => setFocused(i)}
								className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
									active ? "bg-bg text-fg" : "text-muted hover:text-fg hover:bg-bg/50"
								} ${i === focused ? "ring-1 ring-inset ring-accent" : ""}`}
							>
								{tab.icon && (
									<span className="w-4 h-4" aria-hidden="true">
										{tab.icon}
									</span>
								)}
								{tab.label}
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}

export type { TabNavProps, TabNavDropdownProps }

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

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
		<nav className="flex gap-1 p-1 bg-surface rounded-lg" role="tablist">
			{tabs.map((tab) => {
				const active = isActive(tab)
				return (
					<Link
						key={tab.id}
						href={tab.href}
						role="tab"
						aria-selected={active}
						className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
							active
								? "bg-bg text-fg shadow-sm"
								: "text-muted hover:text-fg hover:bg-bg/50"
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
		</nav>
	)
}

interface TabNavDropdownProps {
	tabs: NavTab[]
}

export function TabNavDropdown({ tabs }: TabNavDropdownProps) {
	const pathname = usePathname()

	const isActive = (tab: NavTab) => {
		if (tab.match) {
			return tab.match.some((pattern) => pathname.startsWith(pattern))
		}
		return pathname.startsWith(tab.href)
	}

	const currentTab = tabs.find((tab) => isActive(tab)) || tabs[0]

	return (
		<div className="relative group">
			<button
				type="button"
				className="flex items-center gap-2 px-3 py-2 w-full rounded-lg bg-surface border border-line text-sm font-medium text-fg hover:bg-surface/80 transition-colors"
			>
				{currentTab?.icon && (
					<span className="w-4 h-4" aria-hidden="true">
						{currentTab.icon}
					</span>
				)}
				{currentTab?.label}
				<svg
					className="w-4 h-4 ml-auto text-muted"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>
			<div className="absolute left-0 right-0 top-full mt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-surface border border-line rounded-lg shadow-lg overflow-hidden z-50">
				{tabs.map((tab) => {
					const active = isActive(tab)
					return (
						<Link
							key={tab.id}
							href={tab.href}
							className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
								active ? "bg-bg text-fg" : "text-muted hover:text-fg hover:bg-bg/50"
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
		</div>
	)
}

export type { TabNavProps, TabNavDropdownProps }

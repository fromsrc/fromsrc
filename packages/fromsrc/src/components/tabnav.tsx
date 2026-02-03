"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type KeyboardEvent, type ReactNode, useCallback, useRef, useState } from "react"
import { getNextIndex } from "../hooks/arrownav"
import { IconChevronDown } from "./icons"

/**
 * Individual tab configuration for navigation
 */
export interface NavTab {
	id: string
	label: string
	href: string
	icon?: ReactNode
	match?: string[]
}

/**
 * Props for the horizontal tab navigation component
 */
interface TabNavProps {
	tabs: NavTab[]
	label?: string
}

export function TabNav({ tabs, label = "Navigation" }: TabNavProps): ReactNode {
	const pathname = usePathname()
	const refs = useRef<(HTMLAnchorElement | null)[]>([])

	const isActive = useCallback(
		(tab: NavTab): boolean => {
			if (tab.match) {
				return tab.match.some((pattern) => pathname.startsWith(pattern))
			}
			return pathname.startsWith(tab.href)
		},
		[pathname]
	)

	const handleKeyDown = useCallback(
		(e: KeyboardEvent, index: number): void => {
			const next = getNextIndex(e.key, {
				count: tabs.length,
				current: index,
				direction: "both",
				wrap: true,
			})
			if (next === index) return
			e.preventDefault()
			refs.current[next]?.focus()
		},
		[tabs.length]
	)

	return (
		<nav aria-label={label} role="tablist" className="flex gap-1 p-1 bg-surface rounded-lg">
			{tabs.map((tab, i) => {
				const active = isActive(tab)
				return (
					<Link
						key={tab.id}
						ref={(el) => {
							refs.current[i] = el
						}}
						href={tab.href}
						role="tab"
						tabIndex={active ? 0 : -1}
						aria-selected={active}
						aria-current={active ? "page" : undefined}
						onKeyDown={(e) => handleKeyDown(e, i)}
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
		</nav>
	)
}

/**
 * Props for the dropdown tab navigation component
 */
interface TabNavDropdownProps {
	tabs: NavTab[]
	label?: string
}

export function TabNavDropdown({ tabs, label = "Navigation" }: TabNavDropdownProps): ReactNode {
	const pathname = usePathname()
	const [open, setOpen] = useState(false)
	const [focused, setFocused] = useState(0)
	const containerRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLButtonElement>(null)
	const optionRefs = useRef<(HTMLAnchorElement | null)[]>([])
	const listId = useRef(`tabnav-${Math.random().toString(36).slice(2, 9)}`).current

	const isActive = useCallback(
		(tab: NavTab): boolean => {
			if (tab.match) {
				return tab.match.some((pattern) => pathname.startsWith(pattern))
			}
			return pathname.startsWith(tab.href)
		},
		[pathname]
	)

	const currentTab = tabs.find((tab) => isActive(tab)) || tabs[0]
	const currentIndex = tabs.findIndex((tab) => isActive(tab))

	const openMenu = useCallback((index: number): void => {
		setOpen(true)
		setFocused(index)
		requestAnimationFrame(() => {
			optionRefs.current[index]?.focus()
		})
	}, [])

	const closeMenu = useCallback((): void => {
		setOpen(false)
		buttonRef.current?.focus()
	}, [])

	const handleButtonKeyDown = useCallback(
		(e: KeyboardEvent): void => {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault()
				openMenu(currentIndex >= 0 ? currentIndex : 0)
			}
		},
		[currentIndex, openMenu]
	)

	const handleOptionKeyDown = useCallback(
		(e: KeyboardEvent, index: number): void => {
			if (e.key === "Escape") {
				e.preventDefault()
				closeMenu()
				return
			}
			if (e.key === "Tab") {
				setOpen(false)
				return
			}
			const next = getNextIndex(e.key, {
				count: tabs.length,
				current: index,
				wrap: true,
			})
			if (next === index) return
			e.preventDefault()
			setFocused(next)
			optionRefs.current[next]?.focus()
		},
		[closeMenu, tabs.length]
	)

	const handleButtonClick = useCallback((): void => {
		if (open) {
			closeMenu()
		} else {
			openMenu(currentIndex >= 0 ? currentIndex : 0)
		}
	}, [open, closeMenu, openMenu, currentIndex])

	const handleBlur = useCallback(
		(e: React.FocusEvent): void => {
			if (!containerRef.current?.contains(e.relatedTarget)) {
				setOpen(false)
			}
		},
		[]
	)

	return (
		<nav aria-label={label} className="relative" ref={containerRef}>
			<button
				ref={buttonRef}
				type="button"
				onClick={handleButtonClick}
				onKeyDown={handleButtonKeyDown}
				onBlur={handleBlur}
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-controls={listId}
				className="flex items-center gap-2 px-3 py-2 w-full rounded-lg bg-surface border border-line text-sm font-medium text-fg hover:bg-surface/80 transition-colors"
			>
				{currentTab?.icon && (
					<span className="w-4 h-4" aria-hidden="true">
						{currentTab.icon}
					</span>
				)}
				{currentTab?.label}
				<IconChevronDown
					size={16}
					className={`ml-auto text-muted transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>
			{open && (
				<div
					id={listId}
					role="listbox"
					aria-activedescendant={tabs[focused]?.id}
					className="absolute left-0 right-0 top-full mt-1 bg-surface border border-line rounded-lg shadow-lg overflow-hidden z-50"
				>
					{tabs.map((tab, i) => {
						const active = isActive(tab)
						return (
							<Link
								key={tab.id}
								id={tab.id}
								ref={(el) => {
									optionRefs.current[i] = el
								}}
								href={tab.href}
								role="option"
								tabIndex={-1}
								aria-selected={active}
								onClick={() => setOpen(false)}
								onKeyDown={(e) => handleOptionKeyDown(e, i)}
								onBlur={handleBlur}
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
		</nav>
	)
}

export type { TabNavProps, TabNavDropdownProps }

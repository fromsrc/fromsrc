"use client"

import Link from "next/link"
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import type { DocMeta } from "../content"
import { Folder } from "./folder"
import { IconPanelLeft } from "./icons"
import { NavLink } from "./navlink"

export interface SidebarItem {
	type: "item"
	title: string
	href: string
	icon?: ReactNode
}

export interface SidebarFolder {
	type: "folder"
	title: string
	items: (SidebarItem | SidebarFolder)[]
	defaultOpen?: boolean
	icon?: ReactNode
	href?: string
}

export interface SidebarSection {
	title: string
	items: (SidebarItem | SidebarFolder | DocMeta)[]
}

interface Props {
	title: string
	logo?: ReactNode
	navigation: SidebarSection[]
	basePath?: string
	github?: string
	collapsible?: boolean
	defaultOpenLevel?: number
}

export function Sidebar({
	title,
	logo,
	navigation,
	basePath = "/docs",
	github,
	collapsible,
	defaultOpenLevel = 0,
}: Props): ReactNode {
	const [collapsed, setCollapsed] = useState(false)
	const [hovered, setHovered] = useState(false)
	const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect((): void => {
		const stored = localStorage.getItem("sidebar-collapsed")
		if (stored === "true") setCollapsed(true)
	}, [])

	const toggle = useCallback((): void => {
		setCollapsed((prev) => {
			const next = !prev
			localStorage.setItem("sidebar-collapsed", String(next))
			return next
		})
	}, [])

	const showExpanded = !collapsed || hovered

	const handleEnter = useCallback((): void => {
		if (leaveTimer.current) {
			clearTimeout(leaveTimer.current)
			leaveTimer.current = null
		}
		if (collapsed) setHovered(true)
	}, [collapsed])

	const handleLeave = useCallback((): void => {
		leaveTimer.current = setTimeout(() => setHovered(false), 150)
	}, [])

	const openSearch = useCallback((): void => {
		const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
		window.dispatchEvent(event)
	}, [])

	const translateClass = collapsed
		? hovered
			? "translate-x-0 shadow-xl"
			: "-translate-x-[268px]"
		: "translate-x-0"

	return (
		<>
			<div className="hidden lg:block shrink-0 w-[268px]" />
			<div
				className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-[268px] pointer-events-none"
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
			>
				{collapsed && (
					<div
						className="fixed inset-y-0 left-0 w-6 pointer-events-auto z-40"
						onMouseEnter={handleEnter}
					/>
				)}
				<aside
					aria-label="sidebar navigation"
					aria-expanded={showExpanded}
					className={`${translateClass} w-[268px] h-full flex flex-col bg-bg border-r border-line transition-[transform,box-shadow] duration-250 ease-[cubic-bezier(0.25,0.1,0.25,1)] pointer-events-auto`}
				>
					<SidebarHeader
						title={title}
						logo={logo}
						collapsible={collapsible}
						collapsed={collapsed}
						onToggle={toggle}
					/>
					<SidebarSearch showExpanded={showExpanded} onOpen={openSearch} />
					<SidebarNav
						navigation={navigation}
						basePath={basePath}
						defaultOpenLevel={defaultOpenLevel}
					/>
					{github && <SidebarFooter github={github} />}
				</aside>
			</div>
			{collapsed && !hovered && (
				<div className="hidden lg:flex fixed left-0 top-0 z-50 flex-col gap-1 p-3 pointer-events-auto">
					<button
						type="button"
						onClick={toggle}
						className="w-9 h-9 flex items-center justify-center rounded-lg border border-line bg-surface/80 text-muted hover:text-fg hover:bg-surface transition-colors backdrop-blur-sm"
						aria-label="expand sidebar"
					>
						<IconPanelLeft size={16} />
					</button>
					<button
						type="button"
						onClick={openSearch}
						className="w-9 h-9 flex items-center justify-center rounded-lg border border-line bg-surface/80 text-muted hover:text-fg hover:bg-surface transition-colors backdrop-blur-sm"
						aria-label="open search"
						aria-keyshortcuts="Meta+K"
					>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>
				</div>
			)}
		</>
	)
}

function SidebarHeader({ title, logo, collapsible, collapsed, onToggle }: {
	title: string
	logo?: ReactNode
	collapsible?: boolean
	collapsed: boolean
	onToggle: () => void
}) {
	return (
		<div className="px-4 h-14 flex items-center">
			{collapsible && (
				<button
					type="button"
					onClick={onToggle}
					className="w-10 h-10 flex items-center justify-center text-muted hover:text-fg transition-colors shrink-0"
					aria-label={collapsed ? "expand sidebar" : "collapse sidebar"}
					aria-pressed={!collapsed}
				>
					<IconPanelLeft size={18} />
				</button>
			)}
			<Link
				href="/"
				className="flex items-center gap-2 text-sm font-medium text-fg hover:text-accent transition-colors"
			>
				<div className="w-8 h-8 flex items-center justify-center shrink-0">{logo}</div>
				<span className="whitespace-nowrap">{title}</span>
			</Link>
		</div>
	)
}

function SidebarSearch({ showExpanded, onOpen }: { showExpanded: boolean; onOpen: () => void }) {
	return (
		<div className="px-4 pb-2 flex items-center">
			<button
				type="button"
				onClick={onOpen}
				className="h-9 w-full flex items-center rounded-lg border border-line bg-surface/40 text-muted hover:text-fg hover:bg-surface/80 transition-colors px-3 gap-2"
				aria-label="open search"
				aria-keyshortcuts="Meta+K"
			>
				<svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<span className={`text-sm ${showExpanded ? "block" : "hidden"}`}>search...</span>
				<kbd className={`ml-auto text-[10px] font-mono text-muted/50 ${showExpanded ? "block" : "hidden"}`}>⌘K</kbd>
			</button>
		</div>
	)
}

function SidebarNav({ navigation, basePath, defaultOpenLevel }: {
	navigation: SidebarSection[]
	basePath: string
	defaultOpenLevel: number
}) {
	return (
		<nav
			aria-label="documentation"
			className="px-4 pt-2 pb-8 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
		>
			{navigation.map((section) => (
				<section key={section.title} className="mb-6" aria-labelledby={`section-${section.title}`}>
					<h3 id={`section-${section.title}`} className="px-2 mb-2 text-xs font-medium text-muted/70 whitespace-nowrap">
						{section.title}
					</h3>
					<ul role="list" className="space-y-px">
						{section.items.map((item, i) => {
							if (!("type" in item)) {
								return (
									<li key={item.slug || i}>
										<NavLink href={item.slug ? `${basePath}/${item.slug}` : basePath}>
											{item.title}
										</NavLink>
									</li>
								)
							}
							if (item.type === "folder") {
								return (
									<Folder key={i} folder={item} basePath={basePath} depth={1} defaultOpenLevel={defaultOpenLevel} />
								)
							}
							return (
								<li key={i}>
									<NavLink href={item.href} icon={item.icon}>{item.title}</NavLink>
								</li>
							)
						})}
					</ul>
				</section>
			))}
		</nav>
	)
}

function SidebarFooter({ github }: { github: string }) {
	return (
		<div className="px-4 h-12 border-t border-line bg-bg shrink-0 flex items-center">
			<a
				href={github}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="view on github"
				className="w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-surface/50 transition-colors"
			>
				<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fillRule="evenodd"
						d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
						clipRule="evenodd"
					/>
				</svg>
			</a>
		</div>
	)
}

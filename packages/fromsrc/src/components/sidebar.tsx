"use client"

import { PanelLeft } from "lucide-react"
import Link from "next/link"
import { type ReactNode, useRef, useState } from "react"
import type { DocMeta } from "../content"
import { Folder } from "./folder"
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
}: Props) {
	const [collapsed, setCollapsed] = useState(false)
	const [hovered, setHovered] = useState(false)
	const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const toggle = () => setCollapsed(!collapsed)
	const showExpanded = !collapsed || hovered

	const handleEnter = () => {
		if (leaveTimer.current) {
			clearTimeout(leaveTimer.current)
			leaveTimer.current = null
		}
		if (collapsed) setHovered(true)
	}

	const handleLeave = () => {
		leaveTimer.current = setTimeout(() => setHovered(false), 150)
	}

	return (
		<aside
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
			className={`${collapsed ? (hovered ? "w-60 shadow-lg z-50" : "w-16") : "w-60"} shrink-0 border-r border-line h-screen sticky top-0 flex flex-col bg-bg transition-[width,box-shadow] duration-200 ease-out overflow-hidden`}
		>
			<div className="px-3 h-14 flex items-center">
				{collapsible && (
					<button
						type="button"
						onClick={toggle}
						className="w-10 h-10 flex items-center justify-center text-muted hover:text-fg transition-colors shrink-0"
						aria-label={collapsed ? "expand sidebar" : "collapse sidebar"}
					>
						<PanelLeft size={18} aria-hidden="true" />
					</button>
				)}
				{showExpanded && (
					<Link
						href="/"
						className="flex items-center text-sm text-fg hover:text-accent transition-colors"
					>
						<div className="w-10 h-10 flex items-center justify-center shrink-0 text-muted">
							{logo}
						</div>
						<span className="whitespace-nowrap">{title}</span>
					</Link>
				)}
			</div>
			<div className="px-3 h-12 flex items-center">
				<button
					type="button"
					onClick={() => {
						const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true })
						window.dispatchEvent(event)
					}}
					className={`h-8 flex items-center rounded-md border border-line bg-surface/50 text-muted hover:text-fg hover:bg-surface transition-colors ${showExpanded ? "w-full px-2.5 gap-2" : "w-10 justify-center"}`}
					aria-label="search"
				>
					<svg
						className="w-4 h-4 shrink-0"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<span
						className={`text-xs transition-opacity duration-200 ${showExpanded ? "block" : "hidden"}`}
					>
						search...
					</span>
					<kbd
						className={`ml-auto text-[10px] font-mono text-muted/60 transition-opacity duration-200 ${showExpanded ? "block" : "hidden"}`}
					>
						⌘K
					</kbd>
				</button>
			</div>
			<nav
				className="px-3 pt-2 flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
				style={{
					maskImage: "linear-gradient(to bottom, white 0%, white calc(100% - 12px), transparent)",
				}}
			>
				{!showExpanded ? (
					<div className="flex flex-col items-center">
						{navigation.flatMap((section) =>
							section.items.map((item, i) => {
								const href = !("type" in item)
									? item.slug
										? `${basePath}/${item.slug}`
										: basePath
									: item.type === "item"
										? item.href
										: null
								if (!href) return null
								const icon = "icon" in item ? item.icon : null
								return (
									<Link
										key={i}
										href={href}
										className="w-10 h-8 flex items-center justify-center my-0.5 rounded-md text-muted hover:text-fg hover:bg-surface/50 transition-colors [&>svg]:w-4 [&>svg]:h-4"
										title={item.title}
									>
										{icon || <span className="w-4 h-4 rounded bg-surface" />}
									</Link>
								)
							}),
						)}
					</div>
				) : (
					navigation.map((section) => (
						<div key={section.title} className="mb-6">
							<h3 className="px-2 mb-2 text-[11px] text-muted uppercase tracking-wider whitespace-nowrap">
								{section.title}
							</h3>
							<ul className="space-y-0.5">
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
											<Folder
												key={i}
												folder={item}
												basePath={basePath}
												depth={1}
												defaultOpenLevel={defaultOpenLevel}
											/>
										)
									}
									return (
										<li key={i}>
											<NavLink href={item.href} icon={item.icon}>
												{item.title}
											</NavLink>
										</li>
									)
								})}
							</ul>
						</div>
					))
				)}
			</nav>
			{github && (
				<div className="px-3 h-12 border-t border-line bg-bg shrink-0 flex items-center">
					<a
						href={github}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="view on github"
						className="w-10 h-8 flex items-center justify-center text-muted hover:text-fg transition-colors"
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
			)}
		</aside>
	)
}

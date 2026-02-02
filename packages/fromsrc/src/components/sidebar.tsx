"use client"

import Link from "next/link"
import { useState, useEffect, type ReactNode } from "react"
import type { DocMeta } from "../content"
import { NavLink } from "./navlink"
import { Search } from "./search"
import { Folder } from "./folder"

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
}

export interface SidebarSection {
	title: string
	items: (SidebarItem | SidebarFolder | DocMeta)[]
}

interface Props {
	title: string
	logo?: ReactNode
	navigation: SidebarSection[]
	docs: DocMeta[]
	basePath?: string
	github?: string
	collapsible?: boolean
}

export function Sidebar({ title, logo, navigation, docs, basePath = "/docs", github, collapsible }: Props) {
	const [mounted, setMounted] = useState(false)
	const [collapsed, setCollapsed] = useState(false)

	useEffect(() => {
		setMounted(true)
		const saved = localStorage.getItem("sidebar-collapsed")
		if (saved === "true") setCollapsed(true)
	}, [])

	const toggle = () => {
		const next = !collapsed
		setCollapsed(next)
		localStorage.setItem("sidebar-collapsed", String(next))
	}

	return (
		<aside
			suppressHydrationWarning
			className={`${collapsed ? "w-16" : "w-60"} shrink-0 border-r border-line h-screen sticky top-0 flex flex-col bg-bg transition-[width] duration-200`}
		>
			<div className={collapsed ? "p-3" : "p-5"}>
				<Link href="/" className="flex items-center gap-2.5 text-sm text-fg hover:text-accent transition-colors">
					<div className="p-1.5 rounded-lg bg-surface border border-line shrink-0">
						{logo}
					</div>
					{!collapsed && title}
				</Link>
			</div>
			{!collapsed && (
				<div className="px-4 mb-6">
					<Search basePath={basePath} docs={docs} />
				</div>
			)}
			{collapsed ? (
				<nav className="px-2 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
					{navigation.flatMap((section) =>
						section.items.map((item, i) => {
							const href = !("type" in item)
								? item.slug ? `${basePath}/${item.slug}` : basePath
								: item.type === "item" ? item.href : null
							if (!href) return null
							const icon = "icon" in item ? item.icon : null
							return (
								<Link
									key={i}
									href={href}
									className="flex items-center justify-center p-2 my-0.5 rounded-md text-muted hover:text-fg hover:bg-surface/50 transition-colors"
									title={item.title}
								>
									{icon || <span className="w-4 h-4 rounded bg-surface" />}
								</Link>
							)
						})
					)}
				</nav>
			) : (
				<nav className="px-4 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
					{navigation.map((section) => (
						<div key={section.title} className="mb-6">
							<h3 className="px-2 mb-2 text-[11px] text-muted uppercase tracking-wider">
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
										return <Folder key={i} folder={item} basePath={basePath} />
									}
									return (
										<li key={i}>
											<NavLink href={item.href} icon={item.icon}>{item.title}</NavLink>
										</li>
									)
								})}
							</ul>
						</div>
					))}
				</nav>
			)}
			<div className={`${collapsed ? "p-2" : "p-4"} border-t border-line bg-bg shrink-0 flex ${collapsed ? "flex-col gap-2" : "justify-between"} items-center`}>
				{github && (
					<a
						href={github}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-2 text-xs text-muted hover:text-fg transition-colors"
						title="github"
					>
						<svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path
								fillRule="evenodd"
								d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
								clipRule="evenodd"
							/>
						</svg>
						{!collapsed && "github"}
					</a>
				)}
				{collapsible && (
					<button
						type="button"
						onClick={toggle}
						className="p-1.5 text-muted hover:text-fg transition-colors"
						aria-label={collapsed ? "expand sidebar" : "collapse sidebar"}
					>
						<svg
							className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
						</svg>
					</button>
				)}
			</div>
		</aside>
	)
}

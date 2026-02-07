"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useCallback, useEffect, useState } from "react"
import { NavLink } from "./navlink"
import type { SidebarFolder } from "./sidebar"

interface Props {
	folder: SidebarFolder
	basePath: string
	depth?: number
	defaultOpenLevel?: number
}

export function Folder({ folder, basePath, depth = 1, defaultOpenLevel = 0 }: Props): ReactNode {
	const pathname = usePathname()
	const isActive = folder.href && pathname === folder.href
	const hasActiveChild = folder.items.some((item) => {
		if (item.type === "folder") {
			return item.items.some((child) => child.type === "item" && pathname === child.href)
		}
		return item.type === "item" && pathname === item.href
	})

	const shouldAutoOpen = folder.defaultOpen ?? depth <= defaultOpenLevel
	const [open, setOpen] = useState(shouldAutoOpen)

	useEffect((): void => {
		if (hasActiveChild || isActive) setOpen(true)
	}, [hasActiveChild, isActive])

	const toggle = useCallback((): void => {
		setOpen((prev) => !prev)
	}, [])

	return (
		<li role="treeitem" aria-expanded={open}>
			<div className="flex items-center">
				{folder.href ? (
					<Link
						href={folder.href}
						prefetch
						aria-current={isActive ? "page" : undefined}
						className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors [transition-duration:150ms] hover:[transition-duration:0ms] ${
							isActive ? "text-fg bg-surface/80 font-medium" : "text-muted hover:text-fg hover:bg-surface/50"
						}`}
					>
						{folder.icon && (
							<span className="w-4 h-4 shrink-0" aria-hidden="true">
								{folder.icon}
							</span>
						)}
						<span className="flex-1 text-left truncate">{folder.title}</span>
					</Link>
				) : (
					<button
						type="button"
						onClick={toggle}
						aria-expanded={open}
						aria-controls={`folder-${folder.title}`}
						className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-muted hover:text-fg rounded-lg hover:bg-surface/50 transition-colors [transition-duration:150ms] hover:[transition-duration:0ms]"
					>
						{folder.icon && (
							<span className="w-4 h-4 shrink-0" aria-hidden="true">
								{folder.icon}
							</span>
						)}
						<span className="flex-1 text-left truncate">{folder.title}</span>
					</button>
				)}
				<button
					type="button"
					onClick={toggle}
					aria-expanded={open}
					aria-label={open ? `collapse ${folder.title}` : `expand ${folder.title}`}
					aria-controls={`folder-${folder.title}`}
					className="p-1 text-muted hover:text-fg transition-colors rounded"
				>
					<svg
						className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? "" : "-rotate-90"}`}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
					</svg>
				</button>
			</div>
			{open && (
				<ul
					id={`folder-${folder.title}`}
					role="group"
					className="mt-0.5 ml-2 pl-2.5 border-l border-line/50 space-y-px"
				>
					{folder.items.map((item) => {
						if (item.type === "folder") {
							return (
								<Folder
									key={item.title}
									folder={item}
									basePath={basePath}
									depth={depth + 1}
									defaultOpenLevel={defaultOpenLevel}
								/>
							)
						}
						return (
							<li key={item.href} role="treeitem">
								<NavLink href={item.href} icon={item.icon}>
									{item.title}
								</NavLink>
							</li>
						)
					})}
				</ul>
			)}
		</li>
	)
}

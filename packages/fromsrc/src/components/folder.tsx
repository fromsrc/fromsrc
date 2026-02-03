"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useCallback, useEffect, useState } from "react"
import { NavLink } from "./navlink"
import type { SidebarFolder } from "./sidebar"

/**
 * Props for the Folder component.
 */
interface Props {
	/** The folder data containing title, items, and optional icon/href. */
	folder: SidebarFolder
	/** Base path for constructing navigation URLs. */
	basePath: string
	/** Current nesting depth of this folder. */
	depth?: number
	/** How many levels deep folders should be open by default. */
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

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLButtonElement>): void => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault()
				toggle()
			}
		},
		[toggle],
	)

	return (
		<li role="treeitem" aria-expanded={open}>
			<div className="flex items-center">
				{folder.href ? (
					<Link
						href={folder.href}
						prefetch
						aria-current={isActive ? "page" : undefined}
						className={`flex-1 flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors ${
							isActive ? "text-fg bg-surface" : "text-muted hover:text-fg"
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
						onKeyDown={handleKeyDown}
						aria-expanded={open}
						aria-controls={`folder-${folder.title}`}
						className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs text-muted hover:text-fg rounded-md transition-colors"
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
					onKeyDown={handleKeyDown}
					aria-expanded={open}
					aria-label={open ? `collapse ${folder.title}` : `expand ${folder.title}`}
					aria-controls={`folder-${folder.title}`}
					className="p-1 text-muted hover:text-fg transition-colors"
				>
					<svg
						className={`w-3.5 h-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
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
					className="mt-0.5 ml-2 pl-2 border-l border-line space-y-0.5"
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

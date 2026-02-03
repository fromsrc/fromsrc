"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { NavLink } from "./navlink"
import type { SidebarFolder } from "./sidebar"

interface Props {
	folder: SidebarFolder
	basePath: string
}

export function Folder({ folder, basePath }: Props) {
	const pathname = usePathname()
	const hasActiveChild = folder.items.some((item) => {
		if (item.type === "folder") {
			return item.items.some((child) => child.type === "item" && pathname === child.href)
		}
		return item.type === "item" && pathname === item.href
	})

	const [open, setOpen] = useState(folder.defaultOpen ?? false)

	useEffect(() => {
		if (hasActiveChild) setOpen(true)
	}, [hasActiveChild])

	return (
		<li>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted hover:text-fg rounded-md transition-colors"
			>
				{folder.icon && <span className="w-4 h-4 shrink-0">{folder.icon}</span>}
				<span className="flex-1 text-left truncate">{folder.title}</span>
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
			{open && (
				<ul className="mt-0.5 ml-2 pl-2 border-l border-line space-y-0.5">
					{folder.items.map((item) => {
						if (item.type === "folder") {
							return <Folder key={item.title} folder={item} basePath={basePath} />
						}
						return (
							<li key={item.href}>
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

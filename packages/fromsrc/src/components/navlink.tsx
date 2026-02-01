"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

interface Props {
	href: string
	children: ReactNode
}

export function NavLink({ href, children }: Props) {
	const pathname = usePathname()
	const isActive = pathname === href

	return (
		<Link
			href={href}
			className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md border transition-colors ${
				isActive
					? "text-fg bg-surface border-line"
					: "text-muted hover:text-fg hover:bg-surface/50 border-transparent"
			}`}
		>
			{isActive && (
				<span className="w-1 h-1 rounded-full bg-accent" />
			)}
			{children}
		</Link>
	)
}

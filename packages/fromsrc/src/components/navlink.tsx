"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

interface Props {
	href: string
	children: ReactNode
	icon?: ReactNode
	onClick?: () => void
}

export function NavLink({ href, children, icon, onClick }: Props) {
	const pathname = usePathname()
	const isActive = pathname === href

	return (
		<Link
			href={href}
			onClick={onClick}
			prefetch
			className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md border-l-2 transition-colors ${
				isActive
					? "text-fg bg-surface border-accent"
					: "text-muted hover:text-fg hover:bg-surface/50 border-transparent"
			}`}
		>
			{icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
			<span className="truncate">{children}</span>
		</Link>
	)
}

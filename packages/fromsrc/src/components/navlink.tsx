"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

interface Props {
	href: string
	children: ReactNode
	onClick?: () => void
}

export function NavLink({ href, children, onClick }: Props) {
	const pathname = usePathname()
	const isActive = pathname === href

	return (
		<Link
			href={href}
			onClick={onClick}
			className={`block px-2 py-1.5 text-xs rounded-md transition-colors ${
				isActive
					? "text-fg bg-surface border-l-2 border-accent"
					: "text-muted hover:text-fg hover:bg-surface/50"
			}`}
		>
			{children}
		</Link>
	)
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type ReactNode, useEffect, useRef } from "react"

export interface NavLinkProps {
	href: string
	children: ReactNode
	icon?: ReactNode
	onClick?: () => void
	external?: boolean
}

export function NavLink({ href, children, icon, onClick, external }: NavLinkProps) {
	const pathname = usePathname()
	const isActive = pathname === href
	const ref = useRef<HTMLAnchorElement>(null)
	const isExternal = external ?? href.startsWith("http")

	useEffect(() => {
		if (isActive && ref.current) {
			ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" })
		}
	}, [isActive])

	if (isExternal) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noopener noreferrer"
				onClick={onClick}
				className="flex items-center gap-2 px-2 py-2 lg:py-1.5 min-h-[44px] lg:min-h-0 text-xs rounded-md border-l-2 text-muted hover:text-fg active:text-fg hover:bg-surface/50 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
			>
				{icon && (
					<span className="w-4 h-4 shrink-0" aria-hidden="true">
						{icon}
					</span>
				)}
				<span className="truncate">{children}</span>
				<svg
					className="w-3 h-3 shrink-0 opacity-50"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
					/>
				</svg>
			</a>
		)
	}

	return (
		<Link
			ref={ref}
			href={href}
			onClick={onClick}
			prefetch
			aria-current={isActive ? "page" : undefined}
			className={`flex items-center gap-2 px-2 py-2 lg:py-1.5 min-h-[44px] lg:min-h-0 text-xs rounded-md border-l-2 transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${
				isActive
					? "text-fg bg-surface border-accent"
					: "text-muted hover:text-fg active:text-fg hover:bg-surface/50 border-transparent"
			}`}
		>
			{icon && (
				<span className="w-4 h-4 shrink-0" aria-hidden="true">
					{icon}
				</span>
			)}
			<span className="truncate">{children}</span>
		</Link>
	)
}

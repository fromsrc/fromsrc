"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type JSX, type ReactNode, memo, useEffect, useRef } from "react"

/**
 * Props for the NavLink component
 */
export interface NavLinkProps {
	/** Target URL for the link */
	href: string
	/** Link content */
	children: ReactNode
	/** Optional icon displayed before the link text */
	icon?: ReactNode
	/** Optional click handler */
	onClick?: () => void
	/** Force external link behavior (auto-detected for http urls) */
	external?: boolean
}

function NavLinkComponent({
	href,
	children,
	icon,
	onClick,
	external,
}: NavLinkProps): JSX.Element {
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
				aria-label={`${typeof children === "string" ? children : ""} (opens in new tab)`}
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
					role="img"
					aria-label="External link"
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

/**
 * Navigation link with active state detection and scroll-into-view behavior
 */
export const NavLink = memo(NavLinkComponent)

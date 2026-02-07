"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { type JSX, type ReactNode, memo, useEffect, useRef } from "react"

export interface NavLinkProps {
	href: string
	children: ReactNode
	icon?: ReactNode
	onClick?: () => void
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
				className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg text-muted hover:bg-surface/50 hover:text-fg transition-colors [transition-duration:150ms] hover:[transition-duration:0ms]"
			>
				{icon && (
					<span className="w-4 h-4 shrink-0 [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">
						{icon}
					</span>
				)}
				<span className="truncate">{children}</span>
				<svg
					className="w-3 h-3 shrink-0 opacity-40"
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
			className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors [transition-duration:150ms] hover:[transition-duration:0ms] ${
				isActive
					? "text-fg bg-surface/80 font-medium"
					: "text-muted hover:text-fg hover:bg-surface/50"
			}`}
		>
			{icon && (
				<span className="w-4 h-4 shrink-0 [&>svg]:w-4 [&>svg]:h-4" aria-hidden="true">
					{icon}
				</span>
			)}
			<span className="truncate">{children}</span>
		</Link>
	)
}

export const NavLink = memo(NavLinkComponent)

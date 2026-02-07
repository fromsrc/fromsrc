"use client"

import type { JSX } from "react"
import { memo } from "react"

export interface NavbarProps {
	logo?: React.ReactNode
	title?: string
	links?: { label: string; href: string; active?: boolean }[]
	actions?: React.ReactNode
	className?: string
	sticky?: boolean
}

function NavbarBase({
	logo,
	title,
	links,
	actions,
	className,
	sticky = true,
}: NavbarProps): JSX.Element {
	return (
		<header
			className={[
				"border-b border-line",
				sticky && "sticky top-0 z-40 bg-surface/80 backdrop-blur",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="mx-auto flex h-14 max-w-7xl items-center px-4">
				<div className="flex items-center gap-2">
					{logo}
					{title && <span className="text-fg font-semibold">{title}</span>}
				</div>
				{links && links.length > 0 && (
					<nav className="mx-auto flex items-center gap-6">
						{links.map((link) => (
							<a
								key={link.href}
								href={link.href}
								className={[
									"text-sm transition-colors hover:text-fg",
									link.active ? "text-fg font-medium" : "text-muted",
								].join(" ")}
							>
								{link.label}
							</a>
						))}
					</nav>
				)}
				{actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
			</div>
		</header>
	)
}

export const Navbar = memo(NavbarBase)

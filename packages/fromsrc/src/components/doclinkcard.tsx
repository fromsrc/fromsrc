"use client"

import { type ReactNode, memo } from "react"

export interface DocLinkCardProps {
	title: string
	description?: string
	href: string
	icon?: ReactNode
	className?: string
}

export interface DocLinkCardsProps {
	children: ReactNode
	columns?: 1 | 2 | 3
	className?: string
}

export const DocLinkCard = memo(function DocLinkCard({
	title, description, href, icon, className,
}: DocLinkCardProps): ReactNode {
	return (
		<a
			href={href}
			className={`flex items-center gap-3 p-4 rounded-xl border border-line bg-surface/30 hover:border-fg/20 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20 transition-all group ${className ?? ""}`}
		>
			{icon && (
				<div aria-hidden="true" className="shrink-0 size-9 rounded-lg bg-bg border border-line flex items-center justify-center text-muted group-hover:text-fg transition-colors">
					{icon}
				</div>
			)}
			<div className="flex-1 min-w-0">
				<div className="text-sm font-medium text-fg truncate">{title}</div>
				{description && <div className="text-sm text-muted truncate mt-0.5">{description}</div>}
			</div>
			<svg aria-hidden="true" className="shrink-0 size-4 text-muted group-hover:text-fg transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M6 4l4 4-4 4" />
			</svg>
		</a>
	)
})

const grid = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" } as const

export const DocLinkCards = memo(function DocLinkCards({
	children, columns = 2, className,
}: DocLinkCardsProps): ReactNode {
	return (
		<nav className={`my-6 grid gap-3 ${grid[columns]} ${className ?? ""}`}>
			{children}
		</nav>
	)
})

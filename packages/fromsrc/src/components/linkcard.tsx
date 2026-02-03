"use client"

import { type ReactNode, memo } from "react"
import { IconExternalLink } from "./icons"

/**
 * Props for the LinkCard component
 */
export interface LinkCardProps {
	/** URL to navigate to */
	href: string
	/** Card title text */
	title: string
	/** Optional description text */
	description?: string
	/** Optional icon element */
	icon?: ReactNode
}

/**
 * A card component that renders a styled link with optional icon and description
 */
export const LinkCard = memo(function LinkCard({
	href,
	title,
	description,
	icon,
}: LinkCardProps): ReactNode {
	const isExternal = href.startsWith("http")

	return (
		<a
			href={href}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noopener noreferrer" : undefined}
			aria-label={isExternal ? `${title} (opens in new tab)` : title}
			className="my-4 flex items-center gap-4 p-4 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-fg/20 transition-colors group"
		>
			{icon && (
				<div
					className="shrink-0 w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-muted group-hover:text-fg transition-colors"
					aria-hidden="true"
				>
					{icon}
				</div>
			)}
			<div className="flex-1 min-w-0">
				<div className="text-sm font-medium text-fg truncate">{title}</div>
				{description && <div className="text-sm text-muted truncate">{description}</div>}
			</div>
			{isExternal && (
				<IconExternalLink
					size={16}
					className="shrink-0 text-muted group-hover:text-fg transition-colors"
					aria-hidden="true"
				/>
			)}
		</a>
	)
})

/**
 * Props for the LinkCards container component
 */
export interface LinkCardsProps {
	/** LinkCard children to render in grid */
	children: ReactNode
}

/**
 * A container component that renders LinkCard children in a responsive grid
 */
export const LinkCards = memo(function LinkCards({ children }: LinkCardsProps): ReactNode {
	return (
		<nav className="my-6 grid gap-3 md:grid-cols-2" aria-label="Related links">
			{children}
		</nav>
	)
})

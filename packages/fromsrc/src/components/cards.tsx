"use client"

import Link from "next/link"
import type { JSX, ReactNode } from "react"

/**
 * Container for Card components in a responsive grid layout.
 * @property children - Card elements to display in grid
 */
export interface CardsProps {
	children: ReactNode
}

export function Cards({ children }: CardsProps): JSX.Element {
	return <div className="my-6 grid gap-4 sm:grid-cols-2">{children}</div>
}

/**
 * A card component that renders as a link or static container.
 * @property title - card heading text
 * @property description - optional subtext below title
 * @property href - optional link destination, renders as anchor when provided
 * @property icon - optional icon element displayed above title
 * @example
 * ```tsx
 * <Card title="setup" href="/docs/setup" />
 * <Card title="feature" description="details" icon={<Icon />} />
 * ```
 */
export interface CardProps {
	title: string
	description?: string
	href?: string
	icon?: ReactNode
}

export function Card({ title, description, href, icon }: CardProps): JSX.Element {
	const content: JSX.Element = (
		<>
			{icon && <div className="mb-3 text-muted">{icon}</div>}
			<h3 className="font-medium text-fg">{title}</h3>
			{description && <p className="mt-1 text-sm text-muted">{description}</p>}
		</>
	)

	const className =
		"block rounded-lg border border-line p-4 transition-colors hover:border-fg/20 hover:bg-fg/[0.02]"

	if (href) {
		return (
			<Link href={href} className={className}>
				{content}
			</Link>
		)
	}

	return <div className={className}>{content}</div>
}

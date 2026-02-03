"use client"

import Link from "next/link"
import type { ReactNode } from "react"

export interface CardsProps {
	children: ReactNode
}

export function Cards({ children }: CardsProps) {
	return <div className="my-6 grid gap-4 sm:grid-cols-2">{children}</div>
}

export interface CardProps {
	title: string
	description?: string
	href?: string
	icon?: ReactNode
}

export function Card({ title, description, href, icon }: CardProps) {
	const content = (
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

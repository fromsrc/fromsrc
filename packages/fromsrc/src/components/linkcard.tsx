"use client"

import type { ReactNode } from "react"
import { IconExternalLink } from "./icons"

interface LinkCardProps {
	href: string
	title: string
	description?: string
	icon?: ReactNode
}

export function LinkCard({ href, title, description, icon }: LinkCardProps) {
	const isExternal = href.startsWith("http")

	return (
		<a
			href={href}
			target={isExternal ? "_blank" : undefined}
			rel={isExternal ? "noopener noreferrer" : undefined}
			className="my-4 flex items-center gap-4 p-4 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 transition-colors group"
		>
			{icon && (
				<div className="shrink-0 w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-muted group-hover:text-fg transition-colors">
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
				/>
			)}
		</a>
	)
}

interface LinkCardsProps {
	children: ReactNode
}

export function LinkCards({ children }: LinkCardsProps) {
	return <div className="my-6 grid gap-3 md:grid-cols-2">{children}</div>
}

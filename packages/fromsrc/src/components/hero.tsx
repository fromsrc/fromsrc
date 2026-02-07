"use client"

import { memo } from "react"

export interface HeroProps {
	title: string
	description?: string
	actions?: { label: string; href: string; variant?: "primary" | "secondary" }[]
	badge?: string
	className?: string
}

export const Hero = memo(function Hero({
	title,
	description,
	actions,
	badge,
	className,
}: HeroProps) {
	return (
		<div className={`flex flex-col items-center px-6 py-20 text-center ${className ?? ""}`}>
			{badge && (
				<span className="mb-4 rounded-full border border-line px-3 py-1 text-xs text-muted">
					{badge}
				</span>
			)}
			<h1 className="max-w-3xl text-4xl font-bold tracking-tight text-fg sm:text-5xl lg:text-6xl">
				{title}
			</h1>
			{description && (
				<p className="mt-6 max-w-2xl text-lg text-muted">{description}</p>
			)}
			{actions && actions.length > 0 && (
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					{actions.map((action) => (
						<a
							key={action.href}
							href={action.href}
							className={
								action.variant === "secondary"
									? "rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-surface/80"
									: "rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
							}
						>
							{action.label}
						</a>
					))}
				</div>
			)}
		</div>
	)
})

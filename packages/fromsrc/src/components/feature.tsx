"use client"

import type { ReactNode } from "react"

interface FeatureProps {
	icon?: ReactNode
	title: string
	children: ReactNode
}

export function Feature({ icon, title, children }: FeatureProps) {
	return (
		<div className="flex gap-4 my-4">
			{icon && (
				<div className="shrink-0 w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center text-muted">
					{icon}
				</div>
			)}
			<div>
				<div className="text-sm font-medium text-fg">{title}</div>
				<div className="text-sm text-muted mt-1">{children}</div>
			</div>
		</div>
	)
}

interface FeaturesProps {
	children: ReactNode
	columns?: 2 | 3
}

export function Features({ children, columns = 2 }: FeaturesProps) {
	const gridClass = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
	return <div className={`grid gap-6 my-6 ${gridClass}`}>{children}</div>
}

interface FeatureCardProps {
	icon?: ReactNode
	title: string
	children: ReactNode
}

export function FeatureCard({ icon, title, children }: FeatureCardProps) {
	return (
		<div className="p-5 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 transition-colors">
			{icon && (
				<div className="w-10 h-10 rounded-lg bg-bg border border-line flex items-center justify-center text-muted mb-3">
					{icon}
				</div>
			)}
			<div className="text-sm font-medium text-fg mb-1">{title}</div>
			<div className="text-sm text-muted">{children}</div>
		</div>
	)
}

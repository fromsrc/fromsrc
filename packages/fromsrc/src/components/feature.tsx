"use client"

import type { ReactNode } from "react"

export interface FeatureProps {
	icon?: ReactNode
	title: string
	children: ReactNode
}

export function Feature({ icon, title, children }: FeatureProps) {
	return (
		<article className="flex gap-3 sm:gap-4 my-4">
			{icon && (
				<div
					aria-hidden="true"
					className="shrink-0 size-9 sm:size-10 rounded-lg bg-surface border border-line flex items-center justify-center text-muted"
				>
					{icon}
				</div>
			)}
			<div>
				<h3 className="text-sm font-medium text-fg">{title}</h3>
				<p className="text-sm text-muted mt-1">{children}</p>
			</div>
		</article>
	)
}

export interface FeaturesProps {
	children: ReactNode
	columns?: 2 | 3
}

export function Features({ children, columns = 2 }: FeaturesProps) {
	const gridClass = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
	return <section className={`grid gap-4 sm:gap-6 my-6 ${gridClass}`}>{children}</section>
}

export interface FeatureCardProps {
	icon?: ReactNode
	title: string
	children: ReactNode
}

export function FeatureCard({ icon, title, children }: FeatureCardProps) {
	return (
		<article className="p-4 sm:p-5 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 transition-colors">
			{icon && (
				<div
					aria-hidden="true"
					className="size-9 sm:size-10 rounded-lg bg-bg border border-line flex items-center justify-center text-muted mb-3"
				>
					{icon}
				</div>
			)}
			<h3 className="text-sm font-medium text-fg mb-1">{title}</h3>
			<p className="text-sm text-muted">{children}</p>
		</article>
	)
}

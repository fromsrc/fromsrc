"use client"

import type { JSX, ReactNode } from "react"
import { memo } from "react"

export type FeatureGridItem = {
	icon?: ReactNode
	title: string
	description: string
	href?: string
}

export type FeatureGridProps = {
	items: FeatureGridItem[]
	columns?: 2 | 3 | 4
	className?: string
}

const columnsMap = {
	2: "lg:grid-cols-2",
	3: "lg:grid-cols-3",
	4: "lg:grid-cols-4",
} as const

function Card({ item }: { item: FeatureGridItem }): JSX.Element {
	const content = (
		<div className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4">
			{item.icon && <div className="text-fg">{item.icon}</div>}
			<div className="font-bold text-fg">{item.title}</div>
			<div className="text-sm text-muted">{item.description}</div>
		</div>
	)

	if (item.href) {
		return (
			<a
				href={item.href}
				className="group transition-transform hover:-translate-y-0.5 [&>div]:transition-colors [&>div]:hover:border-muted"
			>
				{content}
			</a>
		)
	}

	return content
}

export const FeatureGrid = memo(function FeatureGrid({
	items,
	columns = 3,
	className,
}: FeatureGridProps): JSX.Element {
	return (
		<div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${columnsMap[columns]} ${className ?? ""}`}>
			{items.map((item) => (
				<Card key={item.title} item={item} />
			))}
		</div>
	)
})

"use client"

import { memo, type ReactNode } from "react"

interface TocItem {
	id: string
	text: string
	level: number
}

export interface InlineTocProps {
	items: TocItem[]
	title?: string
	className?: string
	maxDepth?: number
	collapsible?: boolean
}

function List({ items }: { items: TocItem[] }): ReactNode {
	return (
		<ul>
			{items.map((item) => (
				<li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}>
					<a href={`#${item.id}`}>{item.text}</a>
				</li>
			))}
		</ul>
	)
}

function InlineTocBase({
	items,
	title = "On this page",
	className,
	maxDepth = 3,
	collapsible = false,
}: InlineTocProps): ReactNode {
	const filtered = items.filter((item) => item.level <= maxDepth)

	if (filtered.length === 0) return null

	const content = collapsible ? (
		<details>
			<summary>{title}</summary>
			<List items={filtered} />
		</details>
	) : (
		<>
			{title && <strong>{title}</strong>}
			<List items={filtered} />
		</>
	)

	return <div className={className}>{content}</div>
}

export const InlineToc = memo(InlineTocBase)

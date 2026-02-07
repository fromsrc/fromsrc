"use client"

import { memo, useEffect, useState } from "react"

export type ScrollSpyProps = {
	items: { id: string; label: string; depth?: number }[]
	className?: string
	activeClassName?: string
	offset?: number
	as?: React.ElementType
}

function ScrollSpy({
	items,
	className,
	activeClassName = "font-semibold text-accent",
	offset = 100,
	as: Tag = "nav",
}: ScrollSpyProps) {
	const [activeId, setActiveId] = useState("")

	useEffect(() => {
		const elements = items
			.map((item) => document.getElementById(item.id))
			.filter(Boolean) as HTMLElement[]

		if (elements.length === 0) return

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

				if (visible.length > 0) {
					setActiveId(visible[0]!.target.id)
				}
			},
			{
				rootMargin: `-${offset}px 0px -40% 0px`,
			},
		)

		for (const el of elements) {
			observer.observe(el)
		}

		return () => observer.disconnect()
	}, [items, offset])

	return (
		<Tag className={className}>
			<ul>
				{items.map((item) => (
					<li
						key={item.id}
						style={{ paddingLeft: item.depth ? `${item.depth * 0.75}rem` : undefined }}
					>
						<a
							href={`#${item.id}`}
							className={activeId === item.id ? activeClassName : undefined}
						>
							{item.label}
						</a>
					</li>
				))}
			</ul>
		</Tag>
	)
}

export const ScrollSpyComponent = memo(ScrollSpy)
export { ScrollSpyComponent as ScrollSpy }

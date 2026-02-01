"use client"

import { useState } from "react"
import type { Heading } from "./hook"

interface Props {
	headings: Heading[]
	title?: string
	collapsible?: boolean
	defaultOpen?: boolean
}

export function TocInline({
	headings,
	title = "on this page",
	collapsible = true,
	defaultOpen = false,
}: Props) {
	const [open, setOpen] = useState(defaultOpen)

	if (headings.length === 0) return null

	const content = (
		<div className="flex flex-col text-sm text-muted">
			{headings.map((heading) => (
				<a
					key={heading.id}
					href={`#${heading.id}`}
					className="border-l border-line py-1.5 hover:text-fg transition-colors"
					style={{ paddingLeft: 12 * Math.max(heading.level - 1, 1) }}
				>
					{heading.text}
				</a>
			))}
		</div>
	)

	if (!collapsible) {
		return (
			<nav aria-label="table of contents" className="my-6 rounded-lg border border-line bg-surface/30 p-4">
				<p className="text-xs font-medium text-fg mb-3">{title}</p>
				{content}
			</nav>
		)
	}

	return (
		<nav aria-label="table of contents" className="my-6 rounded-lg border border-line bg-surface/30">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-fg"
			>
				{title}
				<svg
					className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{open && <div className="px-4 pb-4">{content}</div>}
		</nav>
	)
}

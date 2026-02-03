"use client"

import { type ReactNode, useId, useState } from "react"
import { IconChevronRight } from "./icons"

export interface CollapsibleProps {
	title: string
	defaultOpen?: boolean
	children: ReactNode
}

export function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
	const [open, setOpen] = useState(defaultOpen)
	const id = useId()
	const buttonId = `${id}-button`
	const contentId = `${id}-content`

	return (
		<div className="my-4 rounded-lg border border-line overflow-hidden">
			<button
				id={buttonId}
				type="button"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				aria-controls={contentId}
				className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left text-fg hover:bg-surface/50 transition-colors"
			>
				<IconChevronRight
					size={16}
					className={`text-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`}
				/>
				{title}
			</button>
			<div
				id={contentId}
				role="region"
				aria-labelledby={buttonId}
				className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
			>
				<div className="overflow-hidden">
					<div className="px-4 pb-4 pt-0">{children}</div>
				</div>
			</div>
		</div>
	)
}

export interface DetailsProps {
	summary: string
	children: ReactNode
}

export function Details({ summary, children }: DetailsProps) {
	return (
		<details className="my-4 group">
			<summary className="flex items-center gap-2 cursor-pointer text-sm text-fg list-none [&::-webkit-details-marker]:hidden">
				<IconChevronRight
					size={16}
					className="text-muted transition-transform duration-200 group-open:rotate-90"
				/>
				{summary}
			</summary>
			<div className="mt-2 pl-6 text-sm text-muted">{children}</div>
		</details>
	)
}

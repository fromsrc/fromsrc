"use client"

import { type ReactNode, useState } from "react"

export interface AccordionProps {
	children: ReactNode
}

export function Accordion({ children }: AccordionProps) {
	return <div className="my-6 divide-y divide-line border-y border-line">{children}</div>
}

export interface AccordionItemProps {
	title: string
	children: ReactNode
	defaultOpen?: boolean
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
	const [open, setOpen] = useState(defaultOpen)

	return (
		<div>
			<button
				type="button"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				className="flex w-full items-center justify-between py-4 text-left font-medium transition-colors hover:text-fg"
			>
				{title}
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					fill="currentColor"
					className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
				>
					<path d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
				</svg>
			</button>
			{open && <div className="pb-4 text-sm text-muted">{children}</div>}
		</div>
	)
}

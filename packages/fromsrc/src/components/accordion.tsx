"use client"

import { type ReactNode, useCallback, useId, useState } from "react"

export interface AccordionProps {
	children: ReactNode
}

export function Accordion({ children }: AccordionProps) {
	return <div className="my-6 divide-y divide-line border-y border-line">{children}</div>
}

/**
 * @param title - accordion header text
 * @param children - collapsible content
 * @param defaultOpen - expanded on mount
 */
export interface AccordionItemProps {
	title: string
	children: ReactNode
	defaultOpen?: boolean
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
	const [open, setOpen] = useState(defaultOpen)
	const id = useId()
	const buttonId = `${id}-button`
	const panelId = `${id}-panel`

	const toggle = useCallback(() => setOpen((prev) => !prev), [])

	return (
		<div>
			<button
				id={buttonId}
				type="button"
				onClick={toggle}
				aria-expanded={open}
				aria-controls={panelId}
				className="flex w-full items-center justify-between py-4 text-left font-medium transition-colors hover:text-fg"
			>
				{title}
				<svg
					aria-hidden="true"
					viewBox="0 0 16 16"
					fill="currentColor"
					className={`size-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
				>
					<path d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" />
				</svg>
			</button>
			<div
				id={panelId}
				role="region"
				aria-labelledby={buttonId}
				className={`overflow-hidden transition-all duration-200 ${
					open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="pb-4 text-sm text-muted">{children}</div>
			</div>
		</div>
	)
}

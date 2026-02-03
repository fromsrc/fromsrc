"use client"

import { ChevronRight } from "lucide-react"
import { type ReactNode, useState } from "react"

interface Props {
	title: string
	defaultOpen?: boolean
	children: ReactNode
}

export function Collapsible({ title, defaultOpen = false, children }: Props) {
	const [open, setOpen] = useState(defaultOpen)

	return (
		<div className="my-4 rounded-lg border border-line overflow-hidden">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				aria-expanded={open}
				className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left text-fg hover:bg-surface/50 transition-colors"
			>
				<ChevronRight
					size={16}
					className={`text-muted transition-transform duration-200 ${open ? "rotate-90" : ""}`}
					aria-hidden="true"
				/>
				{title}
			</button>
			<div
				className={`overflow-hidden transition-all duration-200 ${
					open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="px-4 pb-4 pt-0">{children}</div>
			</div>
		</div>
	)
}

interface DetailsProps {
	summary: string
	children: ReactNode
}

export function Details({ summary, children }: DetailsProps) {
	return (
		<details className="my-4 group">
			<summary className="flex items-center gap-2 cursor-pointer text-sm text-fg list-none [&::-webkit-details-marker]:hidden">
				<ChevronRight
					size={16}
					className="text-muted transition-transform duration-200 group-open:rotate-90"
					aria-hidden="true"
				/>
				{summary}
			</summary>
			<div className="mt-2 pl-6 text-sm text-muted">{children}</div>
		</details>
	)
}

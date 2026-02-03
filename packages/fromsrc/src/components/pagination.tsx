"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface PaginationProps {
	prev?: {
		href: string
		title: string
	}
	next?: {
		href: string
		title: string
	}
}

export function Pagination({ prev, next }: PaginationProps) {
	if (!prev && !next) return null

	return (
		<nav
			className="flex items-center justify-between gap-4 mt-12 pt-6 border-t border-line"
			aria-label="Page navigation"
		>
			{prev ? (
				<Link
					href={prev.href}
					className="flex items-center gap-2 px-4 py-3 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 transition-colors group"
				>
					<ChevronLeft
						size={16}
						className="text-muted group-hover:text-fg transition-colors"
						aria-hidden="true"
					/>
					<div className="text-left">
						<div className="text-xs text-muted">previous</div>
						<div className="text-sm font-medium text-fg">{prev.title}</div>
					</div>
				</Link>
			) : (
				<div />
			)}
			{next ? (
				<Link
					href={next.href}
					className="flex items-center gap-2 px-4 py-3 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 transition-colors group"
				>
					<div className="text-right">
						<div className="text-xs text-muted">next</div>
						<div className="text-sm font-medium text-fg">{next.title}</div>
					</div>
					<ChevronRight
						size={16}
						className="text-muted group-hover:text-fg transition-colors"
						aria-hidden="true"
					/>
				</Link>
			) : (
				<div />
			)}
		</nav>
	)
}

export type { PaginationProps }

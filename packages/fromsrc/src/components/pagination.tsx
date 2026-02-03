"use client"

import Link from "next/link"
import { memo } from "react"
import type { JSX } from "react"
import { IconChevronLeft, IconChevronRight } from "./icons"

/**
 * Link destination with href and display title
 */
interface PaginationLink {
	href: string
	title: string
}

/**
 * Props for the Pagination component
 */
interface PaginationProps {
	/** Previous page link */
	prev?: PaginationLink
	/** Next page link */
	next?: PaginationLink
}

function PaginationBase({ prev, next }: PaginationProps): JSX.Element | null {
	if (!prev && !next) return null

	return (
		<nav
			className="flex items-center justify-between gap-4 mt-12 pt-6 border-t border-line"
			aria-label="Pagination navigation"
			role="navigation"
		>
			{prev ? (
				<Link
					href={prev.href}
					rel="prev"
					aria-label={`Go to previous page: ${prev.title}`}
					className="flex items-center gap-2 px-4 py-3 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 transition-colors group"
				>
					<IconChevronLeft
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
				<div aria-hidden="true" />
			)}
			{next ? (
				<Link
					href={next.href}
					rel="next"
					aria-label={`Go to next page: ${next.title}`}
					className="flex items-center gap-2 px-4 py-3 rounded-xl border border-line bg-surface/30 hover:bg-surface/50 transition-colors group"
				>
					<div className="text-right">
						<div className="text-xs text-muted">next</div>
						<div className="text-sm font-medium text-fg">{next.title}</div>
					</div>
					<IconChevronRight
						size={16}
						className="text-muted group-hover:text-fg transition-colors"
						aria-hidden="true"
					/>
				</Link>
			) : (
				<div aria-hidden="true" />
			)}
		</nav>
	)
}

/**
 * Navigation component for previous/next page links
 */
export const Pagination = memo(PaginationBase)

export type { PaginationProps, PaginationLink }

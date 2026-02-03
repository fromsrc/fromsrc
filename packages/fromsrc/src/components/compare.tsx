"use client"

import type { JSX, ReactNode } from "react"

/**
 * visual style variant for comparison columns
 */
export type CompareVariant = "default" | "good" | "bad"

/**
 * props for the compare container component
 */
export interface CompareProps {
	/** child column elements */
	children: ReactNode
	/** accessible label for the comparison group */
	label?: string
}

/**
 * container for side-by-side comparison columns
 */
export function Compare({ children, label }: CompareProps): JSX.Element {
	return (
		<div
			className="my-6 grid gap-3 md:gap-4 md:grid-cols-2"
			role="region"
			aria-label={label || "comparison"}
			aria-roledescription="comparison view"
		>
			{children}
		</div>
	)
}

/**
 * props for individual comparison column
 */
export interface ColumnProps {
	/** column heading text */
	title: string
	/** visual style variant */
	variant?: CompareVariant
	/** column content */
	children: ReactNode
}

const variants: Record<CompareVariant, string> = {
	default: "border-line",
	good: "border-emerald-500/30 bg-emerald-500/5",
	bad: "border-red-500/30 bg-red-500/5",
}

const titleVariants: Record<CompareVariant, string> = {
	default: "text-fg",
	good: "text-emerald-400",
	bad: "text-red-400",
}

/**
 * individual column within a comparison container
 */
export function Column({ title, variant = "default", children }: ColumnProps): JSX.Element {
	const headingId = `column-${title.toLowerCase().replace(/\s+/g, "-")}`
	return (
		<section
			className={`rounded-xl border p-3 md:p-4 ${variants[variant]}`}
			aria-labelledby={headingId}
		>
			<h4
				id={headingId}
				className={`text-sm font-medium mb-2 md:mb-3 ${titleVariants[variant]}`}
			>
				{title}
			</h4>
			<div className="text-sm text-muted space-y-2">{children}</div>
		</section>
	)
}

/**
 * props for before/after comparison row
 */
export interface CompareRowProps {
	/** content for the left (before) column */
	left: ReactNode
	/** content for the right (after) column */
	right: ReactNode
	/** accessible label for left column */
	leftLabel?: string
	/** accessible label for right column */
	rightLabel?: string
}

/**
 * side-by-side before/after comparison row
 */
export function CompareRow({ left, right, leftLabel, rightLabel }: CompareRowProps): JSX.Element {
	const leftId = "compare-row-left"
	const rightId = "compare-row-right"
	const resolvedLeftLabel = leftLabel || "before"
	const resolvedRightLabel = rightLabel || "after"

	return (
		<div
			className="my-6 grid gap-3 md:gap-4 md:grid-cols-2"
			role="region"
			aria-label="before and after comparison"
			aria-roledescription="comparison view"
		>
			<section
				className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 md:p-4"
				aria-labelledby={leftId}
			>
				<h4 id={leftId} className="text-xs text-red-400 mb-2 font-medium">
					{resolvedLeftLabel}
				</h4>
				<div className="text-sm text-muted">{left}</div>
			</section>
			<section
				className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 md:p-4"
				aria-labelledby={rightId}
			>
				<h4 id={rightId} className="text-xs text-emerald-400 mb-2 font-medium">
					{resolvedRightLabel}
				</h4>
				<div className="text-sm text-muted">{right}</div>
			</section>
		</div>
	)
}

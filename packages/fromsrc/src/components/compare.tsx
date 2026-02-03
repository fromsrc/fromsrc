"use client"

import type { ReactNode } from "react"

export type CompareVariant = "default" | "good" | "bad"

interface CompareProps {
	children: ReactNode
	label?: string
}

export function Compare({ children, label }: CompareProps) {
	return (
		<div
			className="my-6 grid gap-3 md:gap-4 md:grid-cols-2"
			role="group"
			aria-label={label || "comparison"}
		>
			{children}
		</div>
	)
}

interface ColumnProps {
	title: string
	variant?: CompareVariant
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

export function Column({ title, variant = "default", children }: ColumnProps) {
	return (
		<section className={`rounded-xl border p-3 md:p-4 ${variants[variant]}`} aria-label={title}>
			<h4 className={`text-sm font-medium mb-2 md:mb-3 ${titleVariants[variant]}`}>{title}</h4>
			<div className="text-sm text-muted space-y-2">{children}</div>
		</section>
	)
}

interface RowProps {
	left: ReactNode
	right: ReactNode
	leftLabel?: string
	rightLabel?: string
}

export function CompareRow({ left, right, leftLabel, rightLabel }: RowProps) {
	return (
		<div
			className="my-6 grid gap-3 md:gap-4 md:grid-cols-2"
			role="group"
			aria-label="before and after comparison"
		>
			<section
				className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 md:p-4"
				aria-label={leftLabel || "before"}
			>
				<h4 className="text-xs text-red-400 mb-2 font-medium">{leftLabel || "before"}</h4>
				<div className="text-sm text-muted">{left}</div>
			</section>
			<section
				className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 md:p-4"
				aria-label={rightLabel || "after"}
			>
				<h4 className="text-xs text-emerald-400 mb-2 font-medium">{rightLabel || "after"}</h4>
				<div className="text-sm text-muted">{right}</div>
			</section>
		</div>
	)
}

"use client"

import type { ReactNode } from "react"

interface CompareProps {
	children: ReactNode
}

export function Compare({ children }: CompareProps) {
	return <div className="my-6 grid gap-4 md:grid-cols-2">{children}</div>
}

interface ColumnProps {
	title: string
	variant?: "default" | "good" | "bad"
	children: ReactNode
}

const variants = {
	default: "border-line",
	good: "border-emerald-500/30 bg-emerald-500/5",
	bad: "border-red-500/30 bg-red-500/5",
}

const titleVariants = {
	default: "text-fg",
	good: "text-emerald-400",
	bad: "text-red-400",
}

export function Column({ title, variant = "default", children }: ColumnProps) {
	return (
		<div className={`rounded-xl border p-4 ${variants[variant]}`}>
			<div className={`text-sm font-medium mb-3 ${titleVariants[variant]}`}>{title}</div>
			<div className="text-sm text-muted space-y-2">{children}</div>
		</div>
	)
}

interface RowProps {
	left: ReactNode
	right: ReactNode
}

export function CompareRow({ left, right }: RowProps) {
	return (
		<div className="my-6 grid gap-4 md:grid-cols-2">
			<div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
				<div className="text-xs text-red-400 mb-2 font-medium">before</div>
				<div className="text-sm text-muted">{left}</div>
			</div>
			<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
				<div className="text-xs text-emerald-400 mb-2 font-medium">after</div>
				<div className="text-sm text-muted">{right}</div>
			</div>
		</div>
	)
}

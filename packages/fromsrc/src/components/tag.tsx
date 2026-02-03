"use client"

import type { ReactNode } from "react"

type TagVariant = "default" | "primary" | "success" | "warning" | "danger"

interface TagProps {
	variant?: TagVariant
	children: ReactNode
}

const variants: Record<TagVariant, string> = {
	default: "bg-surface border-line text-muted",
	primary: "bg-accent/10 border-accent/20 text-accent",
	success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
	warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
	danger: "bg-red-500/10 border-red-500/20 text-red-400",
}

export function Tag({ variant = "default", children }: TagProps) {
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${variants[variant]}`}
		>
			{children}
		</span>
	)
}

interface TagsProps {
	children: ReactNode
}

export function Tags({ children }: TagsProps) {
	return <div className="flex flex-wrap gap-1.5 my-4">{children}</div>
}

export type { TagVariant, TagProps, TagsProps }

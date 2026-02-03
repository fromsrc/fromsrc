"use client"

import type { HTMLAttributes, ReactNode } from "react"

export type TagVariant = "default" | "primary" | "success" | "warning" | "danger"

export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
	variant?: TagVariant
	children: ReactNode
}

const styles: Record<TagVariant, string> = {
	default: "bg-surface border-line text-muted",
	primary: "bg-accent/10 border-accent/20 text-accent",
	success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
	warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
	danger: "bg-red-500/10 border-red-500/20 text-red-400",
}

export function Tag({ variant = "default", className, children, ...props }: TagProps) {
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${styles[variant]}${className ? ` ${className}` : ""}`}
			{...props}
		>
			{children}
		</span>
	)
}

export interface TagsProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
	children: ReactNode
}

export function Tags({ className, children, ...props }: TagsProps) {
	return (
		<div
			role="list"
			aria-label="Tags"
			className={`flex flex-wrap gap-1.5 my-4${className ? ` ${className}` : ""}`}
			{...props}
		>
			{children}
		</div>
	)
}

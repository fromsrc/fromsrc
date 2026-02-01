"use client"

import type { ReactNode } from "react"

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info"

export interface BadgeProps {
	children: ReactNode
	variant?: BadgeVariant
}

const styles: Record<BadgeVariant, string> = {
	default: "bg-surface text-muted border-line",
	success: "bg-green-500/10 text-green-400 border-green-500/30",
	warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
	error: "bg-red-500/10 text-red-400 border-red-500/30",
	info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
}

export function Badge({ children, variant = "default" }: BadgeProps) {
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border ${styles[variant]}`}
		>
			{children}
		</span>
	)
}

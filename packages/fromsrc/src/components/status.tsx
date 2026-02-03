"use client"

import { memo, type JSX } from "react"

export type StatusType = "success" | "warning" | "error" | "info" | "neutral"

/**
 * Props for the Status component.
 */
export interface StatusProps {
	/** Visual style variant */
	type?: StatusType
	/** Status text content */
	children: string
}

const statusStyles: Record<StatusType, string> = {
	success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
	warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
	error: "bg-red-500/10 text-red-400 border-red-500/20",
	info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	neutral: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
}

const dotStyles: Record<StatusType, string> = {
	success: "bg-emerald-400",
	warning: "bg-amber-400",
	error: "bg-red-400",
	info: "bg-blue-400",
	neutral: "bg-zinc-400",
}

export const Status = memo(function Status({
	type = "neutral",
	children,
}: StatusProps): JSX.Element {
	return (
		<span
			role="status"
			aria-label={`Status ${type}: ${children}`}
			aria-live="polite"
			className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyles[type]}`}
		>
			<span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dotStyles[type]}`} />
			{children}
		</span>
	)
})

/**
 * Props for the StatusDot component.
 */
export interface StatusDotProps {
	/** Visual style variant */
	type?: StatusType
	/** Accessible label for screen readers */
	label?: string
	/** Enable pulse animation */
	pulse?: boolean
}

export const StatusDot = memo(function StatusDot({
	type = "neutral",
	label,
	pulse = false,
}: StatusDotProps): JSX.Element {
	return (
		<span
			role="status"
			aria-label={label ?? `Status: ${type}`}
			aria-live="polite"
			className="relative inline-flex"
		>
			<span aria-hidden="true" className={`w-2 h-2 rounded-full ${dotStyles[type]}`} />
			{pulse && (
				<span
					aria-hidden="true"
					className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75 ${dotStyles[type]}`}
				/>
			)}
		</span>
	)
})

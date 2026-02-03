"use client"

import type { ReactNode } from "react"

export type CalloutType = "info" | "warning" | "error" | "tip"

export interface CalloutProps {
	type?: CalloutType
	title?: string
	children: ReactNode
}

const config: Record<CalloutType, { icon: ReactNode; border: string; bg: string; text: string }> = {
	info: {
		icon: (
			<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
					clipRule="evenodd"
				/>
			</svg>
		),
		border: "border-l-blue-500",
		bg: "bg-blue-500/10",
		text: "text-blue-400",
	},
	warning: {
		icon: (
			<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
					clipRule="evenodd"
				/>
			</svg>
		),
		border: "border-l-yellow-500",
		bg: "bg-yellow-500/10",
		text: "text-yellow-400",
	},
	error: {
		icon: (
			<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
				<path
					fillRule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
					clipRule="evenodd"
				/>
			</svg>
		),
		border: "border-l-red-500",
		bg: "bg-red-500/10",
		text: "text-red-400",
	},
	tip: {
		icon: (
			<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
				<path d="M10 1a6 6 0 00-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 00.572.729 6.016 6.016 0 002.856 0A.75.75 0 0012 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0010 1zM8.863 17.414a.75.75 0 00-.226 1.483 9.066 9.066 0 002.726 0 .75.75 0 00-.226-1.483 7.553 7.553 0 01-2.274 0z" />
			</svg>
		),
		border: "border-l-green-500",
		bg: "bg-green-500/10",
		text: "text-green-400",
	},
}

export function Callout({ type = "info", title, children }: CalloutProps) {
	const { icon, border, bg, text } = config[type]

	return (
		<div className={`my-4 rounded border-l-4 ${border} ${bg} px-3 py-2`}>
			{title && <p className={`mb-2 font-semibold ${text}`}>{title}</p>}
			<div className={`flex items-center gap-2 ${text}`}>
				<span className="size-4 shrink-0">{icon}</span>
				<div className="text-sm text-fg/80 [&>p]:m-0">{children}</div>
			</div>
		</div>
	)
}

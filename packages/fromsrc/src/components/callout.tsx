"use client"

import type { ReactNode } from "react"

export type CalloutType = "info" | "warning" | "error" | "tip"

export interface CalloutProps {
	type?: CalloutType
	title?: string
	children: ReactNode
}

const icons: Record<CalloutType, ReactNode> = {
	info: (
		<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
			<path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z" />
		</svg>
	),
	warning: (
		<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
			<path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575L6.457 1.047zM8 5a.75.75 0 00-.75.75v2.5a.75.75 0 001.5 0v-2.5A.75.75 0 008 5zm1 6a1 1 0 11-2 0 1 1 0 012 0z" />
		</svg>
	),
	error: (
		<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
			<path d="M2.343 13.657A8 8 0 1113.657 2.343 8 8 0 012.343 13.657zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z" />
		</svg>
	),
	tip: (
		<svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor" className="size-4">
			<path d="M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 01-1.484.211c-.04-.282-.163-.547-.37-.847a8.695 8.695 0 00-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.75.75 0 01-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848.075-.088.147-.173.213-.253.561-.679.985-1.32.985-2.304 0-2.06-1.637-3.75-4-3.75zM6 15.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zM5.75 12a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" />
		</svg>
	),
}

const styles: Record<CalloutType, string> = {
	info: "border-blue-500/30 bg-blue-500/5 text-blue-400",
	warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
	error: "border-red-500/30 bg-red-500/5 text-red-400",
	tip: "border-green-500/30 bg-green-500/5 text-green-400",
}

export function Callout({ type = "info", title, children }: CalloutProps) {
	return (
		<div className={`my-6 rounded-lg border p-4 ${styles[type]}`}>
			<div className="flex gap-3">
				<div className="h-5 flex items-center shrink-0">{icons[type]}</div>
				<div className="flex-1 min-w-0">
					{title && <p className="font-medium mb-1">{title}</p>}
					<div className="text-sm text-fg/80 leading-5 [&>p]:m-0">{children}</div>
				</div>
			</div>
		</div>
	)
}

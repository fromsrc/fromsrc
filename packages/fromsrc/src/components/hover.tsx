"use client"

import { useState } from "react"

export interface HoverInfoProps {
	children: React.ReactNode
	info: string
	type?: "type" | "value" | "error"
}

export function HoverInfo({ children, info, type = "type" }: HoverInfoProps) {
	const [show, setShow] = useState(false)

	const colors = {
		type: "text-cyan-400",
		value: "text-green-400",
		error: "text-red-400",
	}

	return (
		<span
			className="relative inline cursor-help border-b border-dotted border-current"
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
		>
			{children}
			{show && (
				<span className="absolute left-0 top-full z-50 mt-1 whitespace-nowrap rounded border border-line bg-surface px-2 py-1 font-mono text-xs shadow-lg">
					<span className={colors[type]}>{info}</span>
				</span>
			)}
		</span>
	)
}

export interface TypePopupProps {
	trigger: React.ReactNode
	content: React.ReactNode
}

export function TypePopup({ trigger, content }: TypePopupProps) {
	const [show, setShow] = useState(false)

	return (
		<span
			className="relative inline"
			onMouseEnter={() => setShow(true)}
			onMouseLeave={() => setShow(false)}
		>
			<span className="cursor-help border-b border-dotted border-current">{trigger}</span>
			{show && (
				<span className="absolute left-0 top-full z-50 mt-1 max-w-md rounded border border-line bg-surface p-2 font-mono text-xs shadow-lg">
					{content}
				</span>
			)}
		</span>
	)
}

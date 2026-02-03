"use client"

import { type ReactNode, useCallback, useEffect, useState } from "react"

export interface ZoomProps {
	children: ReactNode
	className?: string
}

export function Zoom({ children, className }: ZoomProps) {
	const [open, setOpen] = useState(false)

	const close = useCallback(() => setOpen(false), [])

	useEffect(() => {
		if (!open) return
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") close()
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [open, close])

	return (
		<>
			<span
				onClick={() => setOpen(true)}
				className={`cursor-zoom-in inline-block ${className || ""}`}
			>
				{children}
			</span>
			{open && (
				<div
					onClick={close}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out p-8"
				>
					<div className="max-w-full max-h-full [&>img]:max-w-full [&>img]:max-h-[80vh] [&>img]:object-contain">
						{children}
					</div>
				</div>
			)}
		</>
	)
}

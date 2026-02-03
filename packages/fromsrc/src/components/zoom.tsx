"use client"

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

export interface ZoomProps {
	children: ReactNode
	className?: string
}

export function Zoom({ children, className }: ZoomProps) {
	const [open, setOpen] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)

	const close = useCallback(() => {
		setOpen(false)
		triggerRef.current?.focus()
	}, [])

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
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setOpen(true)}
				className={`cursor-zoom-in inline-block bg-transparent border-none p-0 ${className || ""}`}
				aria-expanded={open}
				aria-label="zoom image"
			>
				{children}
			</button>
			{open && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="zoomed image"
					onClick={close}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") close()
					}}
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

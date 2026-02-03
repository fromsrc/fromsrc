"use client"

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react"

export interface ZoomProps {
	children: ReactNode
	className?: string
}

export function Zoom({ children, className }: ZoomProps) {
	const [open, setOpen] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const closeRef = useRef<HTMLButtonElement>(null)

	const close = useCallback(() => {
		setOpen(false)
		triggerRef.current?.focus()
	}, [])

	useEffect(() => {
		if (!open) return

		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") close()
			if (e.key === "Tab") {
				e.preventDefault()
				closeRef.current?.focus()
			}
		}

		closeRef.current?.focus()
		document.body.style.overflow = "hidden"
		window.addEventListener("keydown", onKey)

		return () => {
			document.body.style.overflow = ""
			window.removeEventListener("keydown", onKey)
		}
	}, [open, close])

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={() => setOpen(true)}
				className={`cursor-zoom-in inline-block bg-transparent border-none p-0 ${className || ""}`}
				aria-haspopup="dialog"
				aria-label="zoom image"
			>
				{children}
			</button>
			{open && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label="zoomed image"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
				>
					<button
						type="button"
						className="absolute inset-0 cursor-zoom-out"
						onClick={close}
						aria-label="close"
					/>
					<div className="relative max-w-full max-h-full [&>img]:max-w-full [&>img]:max-h-[80vh] [&>img]:object-contain pointer-events-none">
						{children}
					</div>
					<button
						ref={closeRef}
						type="button"
						onClick={close}
						className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
						aria-label="close"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			)}
		</>
	)
}

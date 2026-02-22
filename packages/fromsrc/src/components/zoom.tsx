"use client"

import { type JSX, type ReactNode, useCallback, useEffect, useRef, useState } from "react"
import { useEscapeKey } from "../hooks/escapekey"
import { useScrollLock } from "../hooks/scrolllock"

/**
 * Props for the Zoom component.
 */
export interface ZoomProps {
	/** Content to display as the trigger and zoomed view. */
	children: ReactNode
	/** Optional CSS class for the trigger button. */
	className?: string
}

export function Zoom({ children, className }: ZoomProps): JSX.Element {
	const [open, setOpen] = useState<boolean>(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const closeRef = useRef<HTMLButtonElement>(null)
	const backdropRef = useRef<HTMLButtonElement>(null)

	const isbutton = useCallback(
		(value: HTMLButtonElement | null): value is HTMLButtonElement => value !== null,
		[]
	)

	const close = useCallback((): void => {
		setOpen(false)
		triggerRef.current?.focus()
	}, [])

	const handleOpen = useCallback((): void => {
		setOpen(true)
	}, [])

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>): void => {
				if (e.key === "Tab") {
					e.preventDefault()
					const focusable = [backdropRef.current, closeRef.current].filter(isbutton)
					const current = document.activeElement
					const index = current instanceof HTMLButtonElement ? focusable.indexOf(current) : -1
					const next = e.shiftKey
						? focusable[(index - 1 + focusable.length) % focusable.length]
						: focusable[(index + 1) % focusable.length]
				next?.focus()
			}
		},
		[]
	)

	useEscapeKey(close, open)
	useScrollLock(open)

	useEffect((): void | (() => void) => {
		if (!open) return
		closeRef.current?.focus()
	}, [open])

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				onClick={handleOpen}
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
					onKeyDown={handleKeyDown}
				>
					<button
						ref={backdropRef}
						type="button"
						className="absolute inset-0 cursor-zoom-out"
						onClick={close}
						aria-label="close zoomed view"
					/>
					<div className="relative max-w-full max-h-full [&>img]:max-w-full [&>img]:max-h-[80vh] [&>img]:object-contain pointer-events-none">
						{children}
					</div>
					<button
						ref={closeRef}
						type="button"
						onClick={close}
						className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
						aria-label="close zoomed view"
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

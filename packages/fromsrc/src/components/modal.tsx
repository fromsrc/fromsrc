"use client"

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { useScrollLock } from "../hooks/scrolllock"
import { IconX } from "./icons"

export interface ModalProps {
	open: boolean
	onClose: () => void
	title?: string
	children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
	const id = useId()
	const dialogRef = useRef<HTMLDivElement>(null)
	const previousFocus = useRef<HTMLElement | null>(null)
	const [visible, setVisible] = useState(false)
	const [animate, setAnimate] = useState(false)

	const titleId = title ? `modal-title-${id}` : undefined

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose()
				return
			}

			if (e.key !== "Tab" || !dialogRef.current) return

			const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
			const first = focusable[0]
			const last = focusable[focusable.length - 1]

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault()
				last?.focus()
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault()
				first?.focus()
			}
		},
		[onClose]
	)

	useScrollLock(open)

	useEffect(() => {
		if (open) {
			previousFocus.current = document.activeElement as HTMLElement
			setVisible(true)
			requestAnimationFrame(() => setAnimate(true))
			document.addEventListener("keydown", handleKeyDown)
		} else {
			setAnimate(false)
			const timeout = setTimeout(() => setVisible(false), 150)
			return () => clearTimeout(timeout)
		}

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
			previousFocus.current?.focus()
		}
	}, [open, handleKeyDown])

	useEffect(() => {
		if (visible && dialogRef.current) {
			const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			)
			focusable[0]?.focus()
		}
	}, [visible])

	if (!visible) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				type="button"
				className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${animate ? "opacity-100" : "opacity-0"}`}
				onClick={onClose}
				aria-label="close modal"
			/>
			<div
				ref={dialogRef}
				className={`relative w-full max-w-lg rounded-lg border border-line bg-bg p-6 shadow-xl transition-all duration-150 ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
			>
				<div className="mb-4 flex items-center justify-between">
					{title ? (
						<h2 id={titleId} className="text-lg font-semibold">
							{title}
						</h2>
					) : (
						<div />
					)}
					<button
						type="button"
						onClick={onClose}
						className="rounded p-1 text-muted hover:bg-surface hover:text-fg"
						aria-label="close"
					>
						<IconX size={20} />
					</button>
				</div>
				{children}
			</div>
		</div>
	)
}

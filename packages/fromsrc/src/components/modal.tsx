"use client"

import { X } from "lucide-react"
import { useEffect, type ReactNode } from "react"

export interface ModalProps {
	open: boolean
	onClose: () => void
	title?: string
	children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
	useEffect(() => {
		if (!open) return

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") onClose()
		}

		document.addEventListener("keydown", handleKeyDown)
		document.body.style.overflow = "hidden"

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
			document.body.style.overflow = ""
		}
	}, [open, onClose])

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				type="button"
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
				aria-label="close modal"
			/>
			<div
				className="relative w-full max-w-lg rounded-lg border border-line bg-bg p-6 shadow-xl"
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? "modal-title" : undefined}
			>
				{title && (
					<div className="mb-4 flex items-center justify-between">
						<h2 id="modal-title" className="text-lg font-semibold">
							{title}
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="rounded p-1 text-muted hover:bg-surface hover:text-fg"
							aria-label="close"
						>
							<X className="size-5" aria-hidden />
						</button>
					</div>
				)}
				{children}
			</div>
		</div>
	)
}

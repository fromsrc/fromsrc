"use client"

import type { JSX, ReactNode } from "react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useFocusTrap } from "../hooks/focustrap"
import { useScrollLock } from "../hooks/scrolllock"
import { IconX } from "./icons"

/**
 * Props for the Modal component.
 * @property open - Controls modal visibility
 * @property onClose - Callback invoked when modal should close
 * @property title - Optional heading displayed in modal header
 * @property children - Content rendered inside the modal body
 */
export interface ModalProps {
	open: boolean
	onClose: () => void
	title?: string
	children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps): JSX.Element | null {
	const id = useId()
	const dialogRef = useRef<HTMLDivElement>(null)
	const [visible, setVisible] = useState(false)
	const [animate, setAnimate] = useState(false)

	const titleId = title ? `modal-title-${id}` : undefined

	const handleBackdropClick = useCallback((): void => {
		onClose()
	}, [onClose])

	useScrollLock(open)
	useFocusTrap(dialogRef, { enabled: visible, onEscape: onClose })

	useEffect((): (() => void) | undefined => {
		if (open) {
			setVisible(true)
			requestAnimationFrame((): void => setAnimate(true))
		} else {
			setAnimate(false)
			const timeout = setTimeout((): void => setVisible(false), 150)
			return (): void => clearTimeout(timeout)
		}
	}, [open])

	if (!visible) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<button
				type="button"
				className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${animate ? "opacity-100" : "opacity-0"}`}
				onClick={handleBackdropClick}
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
						onClick={handleBackdropClick}
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

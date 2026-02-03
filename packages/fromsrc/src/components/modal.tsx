"use client"

import type { JSX, ReactNode } from "react"
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useScrollLock } from "../hooks/scrolllock"
import { IconX } from "./icons"

const FOCUSABLE_SELECTOR =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

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
	const previousFocus = useRef<HTMLElement | null>(null)
	const [visible, setVisible] = useState(false)
	const [animate, setAnimate] = useState(false)

	const titleId = title ? `modal-title-${id}` : undefined

	const getFocusableElements = useCallback((): HTMLElement[] => {
		if (!dialogRef.current) return []
		return Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
	}, [])

	const handleKeyDown = useCallback(
		(e: KeyboardEvent): void => {
			if (e.key === "Escape") {
				onClose()
				return
			}

			if (e.key !== "Tab") return

			const focusable = getFocusableElements()
			if (focusable.length === 0) return

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
		[onClose, getFocusableElements],
	)

	const handleBackdropClick = useCallback((): void => {
		onClose()
	}, [onClose])

	useScrollLock(open)

	useEffect((): (() => void) => {
		if (open) {
			previousFocus.current = document.activeElement as HTMLElement
			setVisible(true)
			requestAnimationFrame((): void => setAnimate(true))
			document.addEventListener("keydown", handleKeyDown)
		} else {
			setAnimate(false)
			const timeout = setTimeout((): void => setVisible(false), 150)
			return (): void => clearTimeout(timeout)
		}

		return (): void => {
			document.removeEventListener("keydown", handleKeyDown)
			previousFocus.current?.focus()
		}
	}, [open, handleKeyDown])

	useEffect((): void => {
		if (visible) {
			const focusable = getFocusableElements()
			focusable[0]?.focus()
		}
	}, [visible, getFocusableElements])

	useEffect((): (() => void) | void => {
		if (!visible) return

		const handleFocusIn = (e: FocusEvent): void => {
			if (!dialogRef.current?.contains(e.target as Node)) {
				const focusable = getFocusableElements()
				focusable[0]?.focus()
			}
		}

		document.addEventListener("focusin", handleFocusIn)
		return (): void => document.removeEventListener("focusin", handleFocusIn)
	}, [visible, getFocusableElements])

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

"use client"

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { useClickOutside } from "../hooks/clickoutside"
import { useEscapeKey } from "../hooks/escapekey"

export interface PopoverProps {
	trigger: ReactNode
	children: ReactNode
	align?: "start" | "center" | "end"
	side?: "top" | "bottom"
}

export function Popover({ trigger, children, align = "start", side = "bottom" }: PopoverProps) {
	const [open, setOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const contentId = useId()

	const close = useCallback(() => {
		setOpen(false)
		triggerRef.current?.focus()
	}, [])

	useClickOutside(containerRef, close, open)
	useEscapeKey(close, open)

	useEffect(() => {
		if (open) {
			contentRef.current?.focus()
		}
	}, [open])

	function handleTriggerKey(e: React.KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault()
			setOpen(!open)
		}
		if (e.key === "ArrowDown" && !open) {
			e.preventDefault()
			setOpen(true)
		}
	}

	const alignClass = {
		start: "left-0",
		center: "left-1/2 -translate-x-1/2",
		end: "right-0",
	}[align]

	const sideClass = side === "top" ? "bottom-full mb-2" : "top-full mt-2"

	return (
		<div ref={containerRef} className="relative inline-block">
			<button
				ref={triggerRef}
				type="button"
				aria-expanded={open}
				aria-haspopup="dialog"
				aria-controls={open ? contentId : undefined}
				onClick={() => setOpen(!open)}
				onKeyDown={handleTriggerKey}
				className="inline-flex items-center"
			>
				{trigger}
			</button>
			{open && (
				<div
					ref={contentRef}
					id={contentId}
					role="dialog"
					tabIndex={-1}
					className={`absolute z-50 min-w-[200px] rounded-lg border border-line bg-bg p-3 shadow-lg ${alignClass} ${sideClass}`}
				>
					{children}
				</div>
			)}
		</div>
	)
}

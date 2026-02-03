"use client"

import {
	type JSX,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from "react"
import { useClickOutside } from "../hooks/clickoutside"
import { useEscapeKey } from "../hooks/escapekey"

/**
 * Props for the Popover component
 */
export interface PopoverProps {
	/** Element that triggers the popover */
	trigger: ReactNode
	/** Content to display inside the popover */
	children: ReactNode
	/** Horizontal alignment relative to trigger */
	align?: "start" | "center" | "end"
	/** Vertical position relative to trigger */
	side?: "top" | "bottom"
}

const ALIGN_CLASSES: Record<NonNullable<PopoverProps["align"]>, string> = {
	start: "left-0",
	center: "left-1/2 -translate-x-1/2",
	end: "right-0",
}

const SIDE_CLASSES: Record<NonNullable<PopoverProps["side"]>, string> = {
	top: "bottom-full mb-2",
	bottom: "top-full mt-2",
}

export function Popover({
	trigger,
	children,
	align = "start",
	side = "bottom",
}: PopoverProps): JSX.Element {
	const [open, setOpen] = useState<boolean>(false)
	const [position, setPosition] = useState<{ align: string; side: string }>({
		align: ALIGN_CLASSES[align],
		side: SIDE_CLASSES[side],
	})
	const containerRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const contentId = useId()

	const close = useCallback((): void => {
		setOpen(false)
		triggerRef.current?.focus()
	}, [])

	const toggle = useCallback((): void => {
		setOpen((prev) => !prev)
	}, [])

	useClickOutside(containerRef, close, open)
	useEscapeKey(close, open)

	useEffect((): void => {
		if (open) {
			contentRef.current?.focus()
		}
	}, [open])

	useLayoutEffect((): void => {
		if (!open || !contentRef.current) return

		const content = contentRef.current
		const rect = content.getBoundingClientRect()
		const viewport = {
			width: window.innerWidth,
			height: window.innerHeight,
		}

		let adjustedAlign = ALIGN_CLASSES[align]
		let adjustedSide = SIDE_CLASSES[side]

		if (rect.right > viewport.width) {
			adjustedAlign = ALIGN_CLASSES.end
		} else if (rect.left < 0) {
			adjustedAlign = ALIGN_CLASSES.start
		}

		if (side === "bottom" && rect.bottom > viewport.height) {
			adjustedSide = SIDE_CLASSES.top
		} else if (side === "top" && rect.top < 0) {
			adjustedSide = SIDE_CLASSES.bottom
		}

		setPosition({ align: adjustedAlign, side: adjustedSide })
	}, [open, align, side])

	const handleTriggerKey = useCallback(
		(e: KeyboardEvent<HTMLButtonElement>): void => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault()
				toggle()
			}
			if (e.key === "ArrowDown" && !open) {
				e.preventDefault()
				setOpen(true)
			}
		},
		[open, toggle]
	)

	return (
		<div ref={containerRef} className="relative inline-block">
			<button
				ref={triggerRef}
				type="button"
				aria-expanded={open}
				aria-haspopup="dialog"
				aria-controls={open ? contentId : undefined}
				onClick={toggle}
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
					className={`absolute z-50 min-w-[200px] rounded-lg border border-line bg-bg p-3 shadow-lg ${position.align} ${position.side}`}
				>
					{children}
				</div>
			)}
		</div>
	)
}

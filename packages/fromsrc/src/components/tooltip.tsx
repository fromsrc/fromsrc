"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"

export interface TooltipProps {
	content: ReactNode
	children: ReactNode
	side?: "top" | "bottom"
	delay?: number
}

export function Tooltip({ content, children, side = "top", delay = 200 }: TooltipProps) {
	const [show, setShow] = useState(false)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const triggerRef = useRef<HTMLSpanElement>(null)
	const tooltipRef = useRef<HTMLDivElement>(null)
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

	const updatePosition = () => {
		if (!triggerRef.current || !tooltipRef.current) return

		const trigger = triggerRef.current.getBoundingClientRect()
		const tooltip = tooltipRef.current.getBoundingClientRect()

		const x = trigger.left + trigger.width / 2 - tooltip.width / 2
		const y = side === "top" ? trigger.top - tooltip.height - 8 : trigger.bottom + 8

		setPosition({ x, y })
	}

	const handleEnter = () => {
		timeoutRef.current = setTimeout(() => {
			setShow(true)
			requestAnimationFrame(updatePosition)
		}, delay)
	}

	const handleLeave = () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current)
		setShow(false)
	}

	return (
		<>
			<span
				ref={triggerRef}
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
				onFocus={handleEnter}
				onBlur={handleLeave}
				className="inline"
			>
				{children}
			</span>
			{show && (
				<div
					ref={tooltipRef}
					role="tooltip"
					className="fixed z-50 px-2 py-1 text-xs bg-fg text-bg rounded shadow-lg pointer-events-none"
					style={{ left: position.x, top: position.y }}
				>
					{content}
					<div
						className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-fg rotate-45 ${
							side === "top" ? "-bottom-1" : "-top-1"
						}`}
					/>
				</div>
			)}
		</>
	)
}

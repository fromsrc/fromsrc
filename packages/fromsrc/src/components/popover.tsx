"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export interface PopoverProps {
	trigger: ReactNode
	children: ReactNode
	align?: "start" | "center" | "end"
	side?: "top" | "bottom"
}

export function Popover({ trigger, children, align = "start", side = "bottom" }: PopoverProps) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return

		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}

		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false)
		}

		document.addEventListener("click", handleClick)
		document.addEventListener("keydown", handleKey)
		return () => {
			document.removeEventListener("click", handleClick)
			document.removeEventListener("keydown", handleKey)
		}
	}, [open])

	const alignClass = {
		start: "left-0",
		center: "left-1/2 -translate-x-1/2",
		end: "right-0",
	}[align]

	const sideClass = side === "top" ? "bottom-full mb-2" : "top-full mt-2"

	return (
		<div ref={ref} className="relative inline-block">
			<div onClick={() => setOpen(!open)}>{trigger}</div>
			{open && (
				<div
					className={`absolute z-50 min-w-[200px] rounded-lg border border-line bg-bg p-3 shadow-lg ${alignClass} ${sideClass}`}
				>
					{children}
				</div>
			)}
		</div>
	)
}

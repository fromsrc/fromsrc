"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export interface DropdownItem {
	label: string
	icon?: ReactNode
	onClick?: () => void
	disabled?: boolean
	danger?: boolean
}

export interface DropdownProps {
	trigger: ReactNode
	items: (DropdownItem | "separator")[]
	align?: "start" | "end"
}

export function Dropdown({ trigger, items, align = "start" }: DropdownProps) {
	const [open, setOpen] = useState(false)
	const [index, setIndex] = useState(0)
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!open) return

		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}

		document.addEventListener("click", handleClick)
		return () => document.removeEventListener("click", handleClick)
	}, [open])

	const selectableItems = items.filter((i): i is DropdownItem => i !== "separator")

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!open) {
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
				setOpen(true)
				e.preventDefault()
			}
			return
		}

		switch (e.key) {
			case "Escape":
				setOpen(false)
				break
			case "ArrowDown":
				setIndex((i) => Math.min(i + 1, selectableItems.length - 1))
				e.preventDefault()
				break
			case "ArrowUp":
				setIndex((i) => Math.max(i - 1, 0))
				e.preventDefault()
				break
			case "Enter":
				selectableItems[index]?.onClick?.()
				setOpen(false)
				break
		}
	}

	return (
		<div ref={ref} className="relative inline-block">
			<div
				onClick={() => setOpen(!open)}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				role="button"
				aria-haspopup="menu"
				aria-expanded={open}
			>
				{trigger}
			</div>
			{open && (
				<div
					role="menu"
					className={`absolute z-50 mt-1 min-w-[160px] rounded-lg border border-line bg-bg p-1 shadow-lg ${
						align === "end" ? "right-0" : "left-0"
					}`}
				>
					{items.map((item, i) => {
						if (item === "separator") {
							return <div key={i} className="my-1 h-px bg-line" />
						}

						const itemIndex = selectableItems.indexOf(item)

						return (
							<button
								key={i}
								type="button"
								role="menuitem"
								disabled={item.disabled}
								onClick={() => {
									item.onClick?.()
									setOpen(false)
								}}
								onMouseEnter={() => setIndex(itemIndex)}
								className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors ${
									item.disabled
										? "cursor-not-allowed text-muted/50"
										: item.danger
											? "text-red-400 hover:bg-red-500/10"
											: itemIndex === index
												? "bg-surface text-fg"
												: "text-muted hover:bg-surface hover:text-fg"
								}`}
							>
								{item.icon && <span className="shrink-0">{item.icon}</span>}
								<span>{item.label}</span>
							</button>
						)
					})}
				</div>
			)}
		</div>
	)
}

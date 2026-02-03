"use client"

import { useCallback, useId, useRef, useState, type ReactNode } from "react"
import { useClickOutside } from "../hooks/clickoutside"

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
	const [index, setIndex] = useState(-1)
	const ref = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLDivElement>(null)
	const id = useId()

	const selectableItems = items.filter((i): i is DropdownItem => i !== "separator" && !i.disabled)
	const allItems = items.filter((i): i is DropdownItem => i !== "separator")

	const findNextEnabled = useCallback(
		(current: number, direction: 1 | -1): number => {
			let next = current + direction
			while (next >= 0 && next < selectableItems.length) {
				if (!selectableItems[next].disabled) return next
				next += direction
			}
			return current
		},
		[selectableItems]
	)

	const close = useCallback(() => {
		setOpen(false)
		setIndex(-1)
	}, [])

	useClickOutside(ref, close, open)

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!open) {
			if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
				setOpen(true)
				setIndex(0)
				e.preventDefault()
			}
			return
		}

		switch (e.key) {
			case "Escape":
				setOpen(false)
				triggerRef.current?.focus()
				e.preventDefault()
				break
			case "Tab":
				setOpen(false)
				break
			case "ArrowDown":
				setIndex((i) => findNextEnabled(i, 1))
				e.preventDefault()
				break
			case "ArrowUp":
				setIndex((i) => findNextEnabled(i, -1))
				e.preventDefault()
				break
			case "Home":
				setIndex(0)
				e.preventDefault()
				break
			case "End":
				setIndex(selectableItems.length - 1)
				e.preventDefault()
				break
			case "Enter":
			case " ":
				if (index >= 0) {
					selectableItems[index]?.onClick?.()
					setOpen(false)
					triggerRef.current?.focus()
				}
				e.preventDefault()
				break
		}
	}

	const menuId = `${id}-menu`
	const getItemId = (itemIndex: number) => `${id}-item-${itemIndex}`

	return (
		<div ref={ref} className="relative inline-block">
			<div
				ref={triggerRef}
				onClick={() => setOpen(!open)}
				onKeyDown={handleKeyDown}
				tabIndex={0}
				role="button"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={open ? menuId : undefined}
				aria-activedescendant={open && index >= 0 ? getItemId(index) : undefined}
			>
				{trigger}
			</div>
			{open && (
				<div
					id={menuId}
					role="menu"
					aria-orientation="vertical"
					className={`absolute z-50 mt-1 min-w-[160px] rounded-lg border border-line bg-bg p-1 shadow-lg ${
						align === "end" ? "right-0" : "left-0"
					}`}
				>
					{items.map((item, i) => {
						if (item === "separator") {
							return <div key={i} role="separator" className="my-1 h-px bg-line" />
						}

						const selectableIndex = selectableItems.indexOf(item)
						const itemIndex = allItems.indexOf(item)

						return (
							<button
								key={i}
								id={getItemId(selectableIndex)}
								type="button"
								role="menuitem"
								tabIndex={-1}
								disabled={item.disabled}
								aria-disabled={item.disabled}
								onClick={() => {
									if (item.disabled) return
									item.onClick?.()
									setOpen(false)
									triggerRef.current?.focus()
								}}
								onMouseEnter={() => !item.disabled && setIndex(selectableIndex)}
								className={`flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors ${
									item.disabled
										? "cursor-not-allowed text-muted/50"
										: item.danger
											? selectableIndex === index
												? "bg-red-500/10 text-red-400"
												: "text-red-400 hover:bg-red-500/10"
											: selectableIndex === index
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

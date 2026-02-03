"use client"

import { type ReactNode, useCallback, useId, useRef, useState } from "react"
import { getNextIndex } from "../hooks/arrownav"
import { useClickOutside } from "../hooks/clickoutside"

/**
 * Single item in a dropdown menu
 */
export interface DropdownItem {
	label: string
	icon?: ReactNode
	onClick?: () => void
	disabled?: boolean
	danger?: boolean
}

/**
 * Props for the Dropdown component
 */
export interface DropdownProps {
	trigger: ReactNode
	items: (DropdownItem | "separator")[]
	align?: "start" | "end"
}

export function Dropdown({ trigger, items, align = "start" }: DropdownProps): ReactNode {
	const [open, setOpen] = useState<boolean>(false)
	const [index, setIndex] = useState<number>(-1)
	const ref = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLDivElement>(null)
	const id = useId()

	const selectableItems = items.filter((i): i is DropdownItem => i !== "separator" && !i.disabled)

	const close = useCallback((): void => {
		setOpen(false)
		setIndex(-1)
	}, [])

	useClickOutside(ref, close, open)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent): void => {
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
					close()
					triggerRef.current?.focus()
					e.preventDefault()
					break
				case "Tab":
					close()
					break
				case "ArrowDown":
				case "ArrowUp":
				case "Home":
				case "End": {
					const next = getNextIndex(e.key, {
						count: selectableItems.length,
						current: index,
						wrap: false,
					})
					if (next !== index) setIndex(next)
					e.preventDefault()
					break
				}
				case "Enter":
				case " ":
					if (index >= 0) {
						selectableItems[index]?.onClick?.()
						close()
						triggerRef.current?.focus()
					}
					e.preventDefault()
					break
			}
		},
		[open, index, selectableItems, close],
	)

	const menuId = `${id}-menu`
	const getItemId = useCallback((itemIndex: number): string => `${id}-item-${itemIndex}`, [id])

	const handleTriggerClick = useCallback((): void => {
		setOpen((prev) => !prev)
	}, [])

	const handleItemClick = useCallback(
		(item: DropdownItem): void => {
			if (item.disabled) return
			item.onClick?.()
			close()
			triggerRef.current?.focus()
		},
		[close],
	)

	const handleItemHover = useCallback((item: DropdownItem, selectableIndex: number): void => {
		if (!item.disabled) setIndex(selectableIndex)
	}, [])

	return (
		<div ref={ref} className="relative inline-block">
			<div
				ref={triggerRef}
				onClick={handleTriggerClick}
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

						return (
							<button
								key={i}
								id={getItemId(selectableIndex)}
								type="button"
								role="menuitem"
								tabIndex={-1}
								disabled={item.disabled}
								aria-disabled={item.disabled}
								onClick={() => handleItemClick(item)}
								onMouseEnter={() => handleItemHover(item, selectableIndex)}
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

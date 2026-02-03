"use client"

import { memo, type KeyboardEvent, type ReactElement, useCallback, useRef, useState } from "react"
import { getNextIndex } from "../hooks/arrownav"
import { IconStar } from "./icons"

/**
 * Props for the Rating component
 */
export interface RatingProps {
	/** Current rating value (1-based) */
	value?: number
	/** Maximum number of stars */
	max?: number
	/** Callback when rating changes */
	onChange?: (value: number) => void
	/** Whether the rating is read-only */
	readonly?: boolean
	/** Accessible label for the rating group */
	label?: string
}

function RatingBase({
	value = 0,
	max = 5,
	onChange,
	readonly = false,
	label = "Rating",
}: RatingProps): ReactElement {
	const [hover, setHover] = useState<number | null>(null)
	const [focus, setFocus] = useState<number>(value > 0 ? value - 1 : 0)
	const refs = useRef<(HTMLButtonElement | null)[]>([])

	const display = hover ?? value

	const handleClick = useCallback(
		(index: number): void => {
			onChange?.(index)
		},
		[onChange],
	)

	const handleFocus = useCallback((index: number): void => {
		setFocus(index)
	}, [])

	const handleMouseEnter = useCallback(
		(index: number): void => {
			if (!readonly) {
				setHover(index)
			}
		},
		[readonly],
	)

	const handleMouseLeave = useCallback((): void => {
		setHover(null)
	}, [])

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLButtonElement>, index: number): void => {
			if (readonly) return

			if (e.key === " " || e.key === "Enter") {
				e.preventDefault()
				onChange?.(index + 1)
				return
			}

			const next = getNextIndex(e.key, {
				count: max,
				current: index,
				direction: "both",
				wrap: true,
			})
			if (next === index) return
			e.preventDefault()
			setFocus(next)
			refs.current[next]?.focus()
		},
		[readonly, max, onChange],
	)

	return (
		<div
			className="flex gap-0.5"
			role="radiogroup"
			aria-label={label}
			aria-readonly={readonly}
		>
			{Array.from({ length: max }, (_, i) => {
				const filled = i < display
				const index = i + 1
				const checked = value === index

				return (
					<button
						key={i}
						ref={(el) => {
							refs.current[i] = el
						}}
						type="button"
						role="radio"
						aria-checked={checked}
						aria-label={`Rate ${index} out of ${max} stars`}
						aria-posinset={index}
						aria-setsize={max}
						disabled={readonly}
						tabIndex={readonly ? -1 : focus === i ? 0 : -1}
						onClick={() => handleClick(index)}
						onKeyDown={(e) => handleKeyDown(e, i)}
						onFocus={() => handleFocus(i)}
						onMouseEnter={() => handleMouseEnter(index)}
						onMouseLeave={handleMouseLeave}
						className={`transition-colors ${
							readonly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"
						} ${filled ? "text-yellow-400" : "text-muted/30"}`}
					>
						<IconStar aria-hidden="true" size={20} fill={filled ? "currentColor" : "none"} />
					</button>
				)
			})}
		</div>
	)
}

export const Rating = memo(RatingBase)

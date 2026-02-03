"use client"

import { useRef, useState, type KeyboardEvent } from "react"
import { IconStar } from "./icons"

export interface RatingProps {
	value?: number
	max?: number
	onChange?: (value: number) => void
	readonly?: boolean
	label?: string
}

export function Rating({
	value = 0,
	max = 5,
	onChange,
	readonly = false,
	label = "rating",
}: RatingProps) {
	const [hover, setHover] = useState<number | null>(null)
	const [focus, setFocus] = useState(value > 0 ? value - 1 : 0)
	const refs = useRef<(HTMLButtonElement | null)[]>([])

	const display = hover ?? value

	function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
		if (readonly) return

		let next = index
		switch (e.key) {
			case "ArrowRight":
			case "ArrowDown":
				e.preventDefault()
				next = index < max - 1 ? index + 1 : 0
				break
			case "ArrowLeft":
			case "ArrowUp":
				e.preventDefault()
				next = index > 0 ? index - 1 : max - 1
				break
			case "Home":
				e.preventDefault()
				next = 0
				break
			case "End":
				e.preventDefault()
				next = max - 1
				break
			case " ":
			case "Enter":
				e.preventDefault()
				onChange?.(index + 1)
				return
			default:
				return
		}

		setFocus(next)
		refs.current[next]?.focus()
	}

	return (
		<div className="flex gap-0.5" role="radiogroup" aria-label={label}>
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
						aria-label={`${index} of ${max}`}
						disabled={readonly}
						tabIndex={readonly ? -1 : focus === i ? 0 : -1}
						onClick={() => onChange?.(index)}
						onKeyDown={(e) => handleKeyDown(e, i)}
						onFocus={() => setFocus(i)}
						onMouseEnter={() => !readonly && setHover(index)}
						onMouseLeave={() => setHover(null)}
						className={`transition-colors ${
							readonly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"
						} ${filled ? "text-yellow-400" : "text-muted/30"}`}
					>
						<IconStar size={20} fill={filled ? "currentColor" : "none"} />
					</button>
				)
			})}
		</div>
	)
}

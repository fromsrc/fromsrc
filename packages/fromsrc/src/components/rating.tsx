"use client"

import { Star } from "lucide-react"
import { useState } from "react"

export interface RatingProps {
	value?: number
	max?: number
	onChange?: (value: number) => void
	readonly?: boolean
}

export function Rating({ value = 0, max = 5, onChange, readonly = false }: RatingProps) {
	const [hover, setHover] = useState<number | null>(null)

	const display = hover ?? value

	return (
		<div className="flex gap-0.5" role="radiogroup" aria-label="rating">
			{Array.from({ length: max }, (_, i) => {
				const filled = i < display
				const index = i + 1

				return (
					<button
						key={i}
						type="button"
						role="radio"
						aria-checked={i < value}
						aria-label={`${index} star${index === 1 ? "" : "s"}`}
						disabled={readonly}
						onClick={() => onChange?.(index)}
						onMouseEnter={() => !readonly && setHover(index)}
						onMouseLeave={() => setHover(null)}
						className={`transition-colors ${
							readonly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"
						} ${filled ? "text-yellow-400" : "text-muted/30"}`}
					>
						<Star className="size-5" fill={filled ? "currentColor" : "none"} aria-hidden />
					</button>
				)
			})}
		</div>
	)
}

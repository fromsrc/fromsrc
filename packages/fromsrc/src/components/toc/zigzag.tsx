"use client"

import type { Heading } from "./hook"

interface Props {
	heading: Heading
	upper?: number
	lower?: number
}

function getLineOffset(level: number): number {
	return level >= 3 ? 10 : 0
}

export function ZigzagLine({ heading, upper = heading.level, lower = heading.level }: Props) {
	const offset = getLineOffset(heading.level)
	const upperOffset = getLineOffset(upper)
	const lowerOffset = getLineOffset(lower)

	return (
		<>
			{offset !== upperOffset && (
				<svg viewBox="0 0 16 16" className="absolute -top-1.5 left-0 size-4" aria-hidden="true">
					<line
						x1={upperOffset}
						y1="0"
						x2={offset}
						y2="12"
						className="stroke-line"
						strokeWidth="1"
					/>
				</svg>
			)}
			<div
				className={`absolute inset-y-0 w-px bg-line ${
					offset !== upperOffset ? "top-1.5" : ""
				} ${offset !== lowerOffset ? "bottom-1.5" : ""}`}
				style={{ left: offset }}
			/>
		</>
	)
}

export function getItemOffset(level: number): number {
	return level >= 3 ? 26 : 14
}

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

export interface ZigzagPath {
	path: string
	width: number
	height: number
}

export function buildZigzagPath(
	headings: Heading[],
	container: HTMLElement,
): ZigzagPath | null {
	if (container.clientHeight === 0) return null

	let w = 0
	let h = 0
	const d: string[] = []

	for (let i = 0; i < headings.length; i++) {
		const item = headings[i]
		if (!item) continue

		const element = container.querySelector(`a[href="#${item.id}"]`) as HTMLElement | null
		if (!element) continue

		const styles = getComputedStyle(element)
		const offset = item.level >= 3 ? 10.5 : 0.5
		const top = element.offsetTop + parseFloat(styles.paddingTop)
		const bottom = element.offsetTop + element.clientHeight - parseFloat(styles.paddingBottom)

		w = Math.max(offset, w)
		h = Math.max(h, bottom)

		d.push(`${i === 0 ? "M" : "L"}${offset} ${top}`)
		d.push(`L${offset} ${bottom}`)
	}

	return { path: d.join(" "), width: w + 1, height: h }
}

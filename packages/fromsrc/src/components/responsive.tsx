"use client"

import type { ReactNode } from "react"

interface ShowProps {
	above?: "sm" | "md" | "lg" | "xl"
	below?: "sm" | "md" | "lg" | "xl"
	children: ReactNode
}

const aboveClasses = {
	sm: "hidden sm:block",
	md: "hidden md:block",
	lg: "hidden lg:block",
	xl: "hidden xl:block",
}

const belowClasses = {
	sm: "sm:hidden",
	md: "md:hidden",
	lg: "lg:hidden",
	xl: "xl:hidden",
}

export function Show({ above, below, children }: ShowProps) {
	let className = ""

	if (above) {
		className = aboveClasses[above]
	} else if (below) {
		className = belowClasses[below]
	}

	return <div className={className}>{children}</div>
}

interface GridProps {
	cols?: 1 | 2 | 3 | 4
	gap?: "sm" | "md" | "lg"
	children: ReactNode
}

const colClasses = {
	1: "grid-cols-1",
	2: "grid-cols-1 md:grid-cols-2",
	3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
	4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
}

const gapClasses = {
	sm: "gap-2",
	md: "gap-4",
	lg: "gap-6",
}

export function Grid({ cols = 2, gap = "md", children }: GridProps) {
	return (
		<div className={`grid ${colClasses[cols]} ${gapClasses[gap]} my-6`}>
			{children}
		</div>
	)
}

interface FlexProps {
	direction?: "row" | "col"
	align?: "start" | "center" | "end" | "stretch"
	justify?: "start" | "center" | "end" | "between"
	gap?: "sm" | "md" | "lg"
	wrap?: boolean
	children: ReactNode
}

const directionClasses = {
	row: "flex-row",
	col: "flex-col",
}

const alignClasses = {
	start: "items-start",
	center: "items-center",
	end: "items-end",
	stretch: "items-stretch",
}

const justifyClasses = {
	start: "justify-start",
	center: "justify-center",
	end: "justify-end",
	between: "justify-between",
}

export function Flex({
	direction = "row",
	align = "start",
	justify = "start",
	gap = "md",
	wrap = false,
	children,
}: FlexProps) {
	return (
		<div
			className={`flex ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} ${gapClasses[gap]} ${wrap ? "flex-wrap" : ""} my-4`}
		>
			{children}
		</div>
	)
}

export type { ShowProps, GridProps, FlexProps }

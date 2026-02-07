"use client"

import { memo } from "react"
import type { JSX } from "react"

interface PrevNextLink { title: string; href: string; label?: string }

export interface PrevNextProps {
	prev?: PrevNextLink
	next?: PrevNextLink
	className?: string
}

function Chevron({ direction }: { direction: "left" | "right" }): JSX.Element {
	return (
		<svg
			aria-hidden="true"
			width={16}
			height={16}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
		</svg>
	)
}

function PrevNextBase({ prev, next, className }: PrevNextProps): JSX.Element | null {
	if (!prev && !next) return null
	return (
		<div className={`flex justify-between ${className ?? ""}`}>
			{prev ? (
				<a href={prev.href} className="flex items-center gap-2 text-left mr-auto">
					<Chevron direction="left" />
					<div>
						<div className="text-xs text-muted">{prev.label ?? "Previous"}</div>
						<div className="text-sm">{prev.title}</div>
					</div>
				</a>
			) : <div />}
			{next ? (
				<a href={next.href} className="flex items-center gap-2 text-right ml-auto">
					<div>
						<div className="text-xs text-muted">{next.label ?? "Next"}</div>
						<div className="text-sm">{next.title}</div>
					</div>
					<Chevron direction="right" />
				</a>
			) : <div />}
		</div>
	)
}

export const PrevNext = memo(PrevNextBase)
export type { PrevNextLink }

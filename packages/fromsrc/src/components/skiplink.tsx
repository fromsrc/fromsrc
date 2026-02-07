"use client"

import { memo } from "react"
import type { JSX } from "react"

export interface SkipLinkProps {
	href?: string
	label?: string
	className?: string
}

function SkipLinkBase({
	href = "#content",
	label = "Skip to content",
	className,
}: SkipLinkProps): JSX.Element {
	return (
		<a
			href={href}
			className={`sr-only focus:not-sr-only fixed top-4 left-4 z-50 bg-bg text-fg px-4 py-2 border border-line rounded-md ${className || ""}`}
		>
			{label}
		</a>
	)
}

export const SkipLink = memo(SkipLinkBase)

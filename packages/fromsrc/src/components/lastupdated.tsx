"use client"

import { memo } from "react"

type LastUpdatedProps = {
	date: string | Date
	format?: "relative" | "absolute" | "both"
	className?: string
	prefix?: string
}

function relative(d: Date): string {
	const s = Math.floor((Date.now() - d.getTime()) / 1000)
	if (s < 60) return "just now"
	const m = Math.floor(s / 60)
	if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`
	const h = Math.floor(m / 60)
	if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`
	const days = Math.floor(h / 24)
	if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`
	const months = Math.floor(days / 30)
	if (days < 365) return `${months} month${months === 1 ? "" : "s"} ago`
	const years = Math.floor(days / 365)
	return `${years} year${years === 1 ? "" : "s"} ago`
}

export type { LastUpdatedProps }

export const LastUpdated = memo(function LastUpdated({
	date,
	format = "relative",
	className,
	prefix = "Last updated",
}: LastUpdatedProps) {
	const parsed = typeof date === "string" ? new Date(date) : date
	const iso = parsed.toISOString()
	const abs = parsed.toLocaleDateString()
	const rel = relative(parsed)
	const label = format === "absolute" ? abs : rel
	const title = format === "both" ? abs : undefined

	return (
		<time dateTime={iso} className={className} title={title}>
			{prefix} {label}
		</time>
	)
})
